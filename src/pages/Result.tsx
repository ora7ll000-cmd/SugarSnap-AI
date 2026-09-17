import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, ArrowRight, Save, Activity, Star } from 'lucide-react';
import { useAppContext } from '../store';
import { toast } from 'sonner';

export const Result = () => {
  const navigate = useNavigate();
  const { settings, tempResult, setTempResult, addMeal, addFavorite, favorites } = useAppContext();
  const [isExercise, setIsExercise] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if meal is already in favorites
  useEffect(() => {
    if (tempResult && favorites) {
      const exists = favorites.some(f => f.mealDescription === tempResult.mealDescription);
      setIsFavorite(exists);
    }
  }, [tempResult, favorites]);

  // Exercise recommendation logic based on carbs
  const recommendedExercise = useMemo(() => {
    if (!tempResult) return "";
    const carbs = tempResult.netCarbs;
    const carbIndex = Math.floor(carbs);
    
    if (carbs > 70) {
      const highCarbExercises = [
        "ركض خفيف أو مشي سريع جداً لمدة 20-30 دقيقة.",
        "تمارين كارديو متقطعة (HIIT) لمدة 15-20 دقيقة.",
        "ركوب الدراجة بجهد متوسط إلى عالي لمدة 30 دقيقة.",
        "سباحة متواصلة لمدة 20 دقيقة أو قفز بالحبل.",
        "تمارين رياضية بوزن الجسم مثل (Burpees, Jumping Jacks) لمدة 15 دقيقة."
      ];
      return highCarbExercises[carbIndex % highCarbExercises.length];
    }
    
    if (carbs > 40) {
      const medCarbExercises = [
        "مشي متوسط السرعة لمدة 20 دقيقة في الهواء الطلق.",
        "تمارين مقاومة حركية خفيفة (بوزن الجسم) لمدة 15 دقيقة.",
        "صعود السلالم ونزولها لمدة 10-15 دقيقة.",
        "تمارين حركية منوعة في المنزل لمدة 20 دقيقة لتنشيط الدورة الدموية.",
        "مشي سريع على جهاز المشي مع ميل بسيط."
      ];
      return medCarbExercises[carbIndex % medCarbExercises.length];
    }
    
    const lowCarbExercises = [
      "مشي خفيف ومريح لمدة 10-15 دقيقة.",
      "تمارين إطالة (Stretching) وتحريك للمفاصل.",
      "القيام ببعض المهام المنزلية النشطة (تنظيف، ترتيب).",
      "المشي الخفيف داخل المنزل أو في الفناء لمدة 15 دقيقة.",
      "تمارين حركية خفيفة جداً لتنشيط الجسم لمدة 10 دقائق."
    ];
    return lowCarbExercises[carbIndex % lowCarbExercises.length];
  }, [tempResult]);

  if (!tempResult) {
    return <Navigate to="/scan" replace />;
  }

  const { mealDescription, netCarbs, weight, imageSrc, currentBg } = tempResult;
  const { icr, isf, targetBg } = settings;

  // Medical Logic
  const mealBolus = netCarbs / icr;
  let correctionBolus = 0;
  let isHypo = false;

  if (currentBg) {
    if (currentBg < settings.lowBgLimit) {
      isHypo = true;
    } else if (currentBg > targetBg) {
      correctionBolus = (currentBg - targetBg) / isf;
    }
  }

  const rawTotal = mealBolus + correctionBolus;
  
  // Exercise Reduction Logic (30% reduction)
  const doseAfterExercise = isExercise ? rawTotal * 0.7 : rawTotal;
  const totalDose = isHypo ? 0 : Math.round(doseAfterExercise * 2) / 2; // Round to nearest 0.5 unit

  const handleSave = () => {
    addMeal({
      timestamp: new Date().toISOString(),
      mealDescription,
      weightGrams: weight,
      netCarbs,
      mealBolus: Math.round(mealBolus * 10) / 10,
      correctionBolus: Math.round(correctionBolus * 10) / 10,
      totalDose,
      currentBg,
      image: imageSrc,
      isExerciseMode: isExercise
    });
    setTempResult(null);
    toast.success('تم حفظ الوجبة في السجل بنجاح');
    navigate('/history');
  };

  const handleSaveToFavorites = () => {
    if (isFavorite) {
      toast.info('الوجبة موجودة مسبقاً في المفضلة');
      return;
    }
    const netCarbsPer100g = (netCarbs / weight) * 100;
    addFavorite({
      mealDescription,
      netCarbsPer100g,
      image: imageSrc
    });
    setIsFavorite(true);
    toast.success('تمت الإضافة للمفضلة بنجاح');
  };

  const handleDiscard = () => {
    setTempResult(null);
    navigate('/scan');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full bg-teal-100/40 blur-3xl" />
      
      <main className="flex-1 p-6 max-w-md mx-auto w-full z-10 flex flex-col gap-6 pt-12">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-xl font-bold text-slate-800">النتيجة</h1>
           <button 
             onClick={handleSaveToFavorites} 
             className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm border transition-colors ${isFavorite ? 'border-yellow-300 text-yellow-500 bg-yellow-50' : 'border-slate-100 text-yellow-500 bg-white hover:bg-yellow-50'}`} 
             title="إضافة للمفضلة"
           >
             <Star size={24} className={isFavorite ? "fill-yellow-500" : ""} />
           </button>
        </div>
        
        {isHypo && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coral-50 border border-coral-200 rounded-2xl p-4 flex gap-3 shadow-sm"
          >
            <AlertTriangle className="text-coral-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-coral-700">تنبيه: مستوى السكر منخفض!</h3>
              <p className="text-sm text-coral-600 mt-1">لا تأخذ إنسولين. الرجاء معالجة الهبوط فوراً وتناول كربوهيدرات سريعة الامتصاص.</p>
            </div>
          </motion.div>
        )}

        {/* Hero Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-mint-400" />
          <h2 className="text-sm font-medium text-slate-500 mb-2">الجرعة المقترحة</h2>
          
          <div className="flex items-baseline justify-center gap-2 mb-6 relative">
            <span className={`text-6xl font-black tracking-tight ${isHypo ? 'text-slate-300' : 'text-teal-600'}`}>
              {totalDose}
            </span>
            <span className="text-xl font-bold text-slate-400">وحدة</span>
            {isExercise && !isHypo && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute -right-4 -top-2 bg-mint-100 text-teal-700 text-[10px] font-bold px-2 py-1 rounded-full border border-teal-200"
              >
                -30%
              </motion.div>
            )}
          </div>

          <div className="flex flex-col items-center mb-6 gap-2">
             <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                <img src={imageSrc} alt="Meal" className="w-full h-full object-cover" />
             </div>
             {tempResult.isEstimatedWeight && (
                <div className="bg-coral-100 text-coral-800 text-[10px] font-bold px-3 py-1 rounded-full border border-coral-200 whitespace-nowrap shadow-sm">
                  وزن تقديري (~{weight}g)
                </div>
             )}
          </div>
          
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
            {mealDescription}
          </p>
        </motion.div>

        {/* Exercise Toggle */}
        {!isHypo && (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden transition-all">
            <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExercise ? 'bg-mint-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Activity size={20} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-sm">سأمارس الرياضة</span>
                  <span className="text-[10px] text-slate-500">يقلل الجرعة بنسبة 30% لتفادي الهبوط</span>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isExercise ? 'bg-teal-500' : 'bg-slate-200'}`}>
                 <motion.div 
                   layout
                   className="w-4 h-4 bg-white rounded-full shadow-sm"
                   animate={{ x: isExercise ? -24 : 0 }} // RTL adjustment: negative is left
                 />
              </div>
              {/* hidden checkbox for accessibility */}
              <input type="checkbox" className="hidden" checked={isExercise} onChange={(e) => setIsExercise(e.target.checked)} />
            </label>
            
            <AnimatePresence>
              {isExercise && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-start gap-2"
                >
                  <Activity size={16} className="text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    <span className="font-bold text-teal-700 block mb-0.5">التمرين المقترح لهذه الوجبة:</span>
                    {recommendedExercise}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Details Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-4">التفاصيل والحسابات</h3>
          
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm">الكربوهيدرات الصافية</span>
            <span className="font-bold text-slate-800">{Math.round(netCarbs)}g</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm">جرعة الوجبة (ICR: {icr})</span>
            <span className="font-bold text-slate-800">{Math.round(mealBolus * 10) / 10} وحدة</span>
          </div>
          {currentBg && !isHypo && (
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500 text-sm">جرعة التصحيح (ISF: {isf})</span>
              <span className="font-bold text-slate-800">{Math.round(correctionBolus * 10) / 10} وحدة</span>
            </div>
          )}
        </div>

      </main>

      {/* Footer Actions */}
      <footer className="p-6 bg-white border-t border-slate-100 z-20 pb-28">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isHypo}
            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-md transition-all ${isHypo ? 'bg-slate-300 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
          >
            <Check size={20} />
            حفظ في السجل
          </button>
          <button 
            onClick={handleDiscard}
            className="px-6 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-4 max-w-xs mx-auto leading-relaxed">
          أداة استرشادية مبنية على مدخلاتك ومعاملات طبيبك. تحقق دائماً قبل الحقن.
        </p>
      </footer>
    </div>
  );
};
