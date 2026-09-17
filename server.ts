import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Route: Analyze Meal
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const { image, mimeType, weight, prompt, customApiKey, customModel } = req.body;
      
      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: image,
        },
      };

      const hasWeight = weight && weight > 0;
      
      const basePrompt = hasWeight 
        ? `You are a medical nutrition assistant. The user provided an image of their meal and its weight in grams: ${weight}g.
${prompt ? `The user also provided this additional description/hint to help you identify the food: "${prompt}". Please consider this description heavily in your analysis.` : ''}
Describe the meal briefly and estimate the net carbohydrates for this specific weight.
Also provide the net carbs per 100g.
Provide the output in JSON format with the following keys:
- mealDescription (string, in Arabic)
- netCarbs (number, total net carbs for the provided weight)
- carbsPer100g (number, estimated carbs per 100g of this food)`
        : `CRITICAL MEDICAL TASK: You are a medical nutrition assistant. The user provided an image of their meal but DOES NOT HAVE A FOOD SCALE.
${prompt ? `The user also provided this hint: "${prompt}".\n` : ''}
You must visually estimate the weight and volume of the food based on typical portion sizes, plate dimensions, or relative context.
CRITICAL SAFETY RULE: Be conservative in your carb estimation. Overestimating carbs leads to insulin overdose and severe hypoglycemia. It is safer to slightly underestimate.
Provide the output in JSON format with the following keys:
- mealDescription (string, in Arabic, describe the meal and add a small note that the weight is estimated)
- estimatedWeight (number, your best guess of the total weight in grams based on visual context)
- netCarbs (number, total net carbs for your estimated weight)
- carbsPer100g (number, estimated carbs per 100g of this food)`;

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
            await new Promise((resolve) => setTimeout(resolve, 2000));
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
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
