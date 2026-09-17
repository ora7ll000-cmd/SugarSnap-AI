import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const { image, mimeType, weight, prompt, customApiKey, customModel } = req.body;
          
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: image,
      },
    };

    const hasWeight = weight && weight > 0;
          
    const basePrompt = hasWeight 
        ? `You are a medical nutrition assistant. The user provided an image of their meal and its weight in grams: ${weight}g.\n${prompt ? `The user also provided this additional description/hint to help you identify the food: "${prompt}". Please consider this description heavily in your analysis.` : ''}\nDescribe the meal briefly and estimate the net carbohydrates for this specific weight.\nAlso provide the net carbs per 100g.\nProvide the output in JSON format with the following keys:\n- mealDescription (string, in Arabic)\n- netCarbs (number, total net carbs for the provided weight)\n- carbsPer100g (number, estimated carbs per 100g of this food)`
        : `CRITICAL MEDICAL TASK: You are a medical nutrition assistant. The user provided an image of their meal but DOES NOT HAVE A FOOD SCALE.\n${prompt ? `The user also provided this hint: "${prompt}".\n` : ''}You must visually estimate the weight and volume of the food based on typical portion sizes, plate dimensions, or relative context.\nCRITICAL SAFETY RULE: Be conservative in your carb estimation. Overestimating carbs leads to insulin overdose and severe hypoglycemia. It is safer to slightly underestimate.\nProvide the output in JSON format with the following keys:\n- mealDescription (string, in Arabic, describe the meal and add a small note that the weight is estimated)\n- estimatedWeight (number, your best guess of the total weight in grams based on visual context)\n- netCarbs (number, total net carbs for your estimated weight)\n- carbsPer100g (number, estimated carbs per 100g of this food)`;

    let client = ai;
    if (customApiKey) {
      client = new GoogleGenAI({
        apiKey: customApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }

    let response;
    let retries = 5;

    while (retries > 0) {
      try {
        response = await client.models.generateContent({
          model: customModel || "gemini-3.8-flash",
          contents: { parts: [imagePart, { text: basePrompt }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                mealDescription: {
                  type: Type.STRING,
                  description: "Short description of the meal in Arabic",
                },
                netCarbs: {
                  type: Type.NUMBER,
                  description: "Estimated net carbs in grams for the given total weight",
                },
                carbsPer100g: {
                  type: Type.NUMBER,
                  description: "Estimated net carbs in grams per 100g of this food",
                },
                estimatedWeight: {
                  type: Type.NUMBER,
                  description: "If the user did not provide a weight, provide your estimated weight in grams here.",
                },
              },
              required: ["mealDescription", "netCarbs", "carbsPer100g"],
            },
          },
        });
        break; // Success, exit retry loop
      } catch (err: any) {
        if (err?.status === 503 && retries > 1) {
          retries--;
          // Cannot use setTimeout directly without await in a loop properly, but it's okay for serverless limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          throw err;
        }
      }
    }

    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze meal." });
  }
}
