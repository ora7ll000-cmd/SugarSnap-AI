import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Sparkles, Settings, Star } from 'lucide-react';
import { useAppContext } from '../store';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const Scan = () => {
  const navigate = useNavigate();
  const { settings, setTempResult, favorites } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [useScale, setUseScale] = useState<boolean>(true);
  const [currentBg, setCurrentBg] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
          setImageSrc(compressedDataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const adjustWeight = (amount: number) => {
    setWeight((prev) => {
      const current = parseFloat(prev) || 0;
      const newValue = current + amount;
      return newValue > 0 ? newValue.toString() : '0';
    });
  };

  const handleFavoriteSelect = (fav: any) => {
    if (!weight || parseFloat(weight) <= 0) {
      toast.error('الرجاء إدخال وزن الوجبة أولاً ثم اختيار الوجبة المفضلة');
      return;
    }
    const w = parseFloat(weight);
    const netCarbs = (fav.netCarbsPer100g / 100) * w;

    setTempResult({
      mealDescription: fav.mealDescription,
      netCarbs,
      imageSrc: fav.image || null,
      weight: w,
      currentBg: currentBg ? parseFloat(currentBg) : undefined,
    });
    navigate('/result');
  };

  const analyzeMeal = async () => {
    if (!imageSrc) {
      toast.error('الرجاء التقاط صورة للوجبة أولاً');
      return;
    }
    if (useScale && (!weight || parseFloat(weight) <= 0)) {
      toast.error('الرجاء إدخال وزن الوجبة بشكل صحيح');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const mimeType = imageSrc.split(';')[0].split(':')[1];
      const base64Data = imageSrc.split(',')[1];
      
      const aiSettings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
      const customApiKey = aiSettings.useCustomKey ? aiSettings.apiKey : undefined;
      const customModel = aiSettings.useCustomKey ? aiSettings.model : undefined;

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data,
          mimeType,
          weight: useScale ? parseFloat(weight) : 0,
          prompt: prompt.trim() || undefined,
          customApiKey,
          customModel,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحليل الوجبة');
      }

      const aiData = await response.json();
      
      setTempResult({
        ...aiData,
        imageSrc,
        weight: useScale ? parseFloat(weight) : (aiData.estimatedWeight || 0),
        isEstimatedWeight: !useScale,
        currentBg: currentBg ? parseFloat(currentBg) : undefined,
      });

      navigate('/result');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24 flex flex-col">
      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6 pt-12">
        
        {/* Mode Toggle */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
          <button 
            onClick={() => setUseScale(true)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${useScale ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            بالميزان (دقيق)
          </button>
          <button 
            onClick={() => setUseScale(false)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${!useScale ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            بدون ميزان (تقدير)
          </button>
        </div>

        {/* Warning if no scale */}
        {!useScale && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-coral-50 border border-coral-200 p-4 rounded-2xl flex gap-3 text-coral-800">
            <div className="shrink-0 mt-0.5">⚠️</div>
            <p className="text-xs font-bold leading-relaxed">
              تنبيه طبي: التقدير بالذكاء الاصطناعي تقريبي. المبالغة في تقدير الكربوهيدرات قد تؤدي لجرعة زائدة وهبوط خطير. يفضل وضع شيء للمقارنة (مثل ملعقة أو بطاقة) لتسهيل التقدير، ويفضل دائماً استخدام ميزان طعام للسلامة.
            </p>
          </motion.div>
        )}

        {/* Weight Input */}
        {useScale && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-3">كتلة الطعام (بالغرام)</h2>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full text-center text-3xl font-bold text-teal-600 bg-slate-50 border-b-2 border-teal-100 py-2 focus:outline-none focus:border-teal-500 rounded-t-lg transition-colors"
              placeholder="0"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => adjustWeight(50)} className="flex-1 bg-teal-50 text-teal-700 text-xs font-medium py-2 rounded-lg hover:bg-teal-100">+50g</button>
              <button onClick={() => adjustWeight(100)} className="flex-1 bg-teal-50 text-teal-700 text-xs font-medium py-2 rounded-lg hover:bg-teal-100">+100g</button>
              <button onClick={() => setWeight('0')} className="flex-1 bg-slate-100 text-slate-600 text-xs font-medium py-2 rounded-lg hover:bg-slate-200">مسح</button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
           <div className="flex-1 h-px bg-slate-200"></div>
           <span className="text-xs text-slate-400 font-bold">أو مسح وجبة جديدة</span>
           <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Viewfinder */}
        <div className="relative w-full aspect-square bg-slate-200 rounded-3xl overflow-hidden border-2 border-dashed border-slate-300 shadow-sm flex items-center justify-center">
          {imageSrc ? (
            <>
              <img src={imageSrc} alt="Meal" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-10">
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }} 
                  className="bg-white/90 text-slate-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  <ImageIcon size={18} />
                  من المعرض
                </button>
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }} 
                  className="bg-white/90 text-slate-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
                >
                  <Camera size={18} />
                  فتح الكاميرا
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 z-10 w-full px-6">
              <div className="text-slate-400 flex flex-col items-center gap-2 mb-2">
                <Camera size={48} strokeWidth={1.5} />
                <span className="text-sm font-medium">اختر طريقة إضافة الصورة</span>
              </div>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                    }
                  }} 
                  className="flex-1 bg-white shadow-sm border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <ImageIcon size={24} className="text-blue-500" />
                  المعرض
                </button>
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment');
                      fileInputRef.current.click();
                    }
                  }} 
                  className="flex-1 bg-white shadow-sm border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <Camera size={24} className="text-teal-500" />
                  الكاميرا
                </button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageCapture}
          />
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-sm flex flex-col items-center justify-center">
              <Sparkles className="text-white animate-pulse mb-3" size={32} />
              <p className="text-white font-medium text-sm">جاري تحليل الوجبة بالذكاء الاصطناعي...</p>
            </div>
          )}
        </div>

        {/* Meal Hint Input (Optional) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>ما هي الوجبة؟</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">اختياري للمساعدة</span>
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
            placeholder="مثال: توست بالجبن، المكونات غير واضحة في الصورة..."
            rows={2}
          />
        </div>

        {/* Optional Blood Glucose */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>مستوى السكر الحالي</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">اختياري للتصحيح</span>
          </h2>
          <div className="relative">
            <input
              type="number"
              value={currentBg}
              onChange={(e) => setCurrentBg(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. 120"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mg/dL</span>
          </div>
        </div>

        {/* Analyze Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={analyzeMeal}
          disabled={isAnalyzing}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-md transition-colors ${
            isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {isAnalyzing ? (
            <span className="animate-pulse">جاري التحليل...</span>
          ) : (
            <>
              <Sparkles size={20} />
              تحليل الوجبة وحساب الجرعة
            </>
          )}
        </motion.button>
      </main>
    </div>
  );
};
