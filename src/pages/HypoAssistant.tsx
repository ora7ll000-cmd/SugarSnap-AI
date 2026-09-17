import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';

export const HypoAssistant = () => {
  const navigate = useNavigate();
  const { settings } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      setStep(2);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const startTimer = () => {
    setTimerActive(true);
  };

  const resetProcess = () => {
    setStep(1);
    setTimeLeft(15 * 60);
    setTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[100dvh] bg-coral-50 flex flex-col relative overflow-hidden pb-10">
      
      {/* Decorative background */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] rounded-full bg-coral-200/40 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-coral-100 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowRight size={20} />
        </button>
        <span className="font-bold text-coral-800">مساعد الطوارئ للهبوط</span>
        <div className="w-10 h-10" />
      </header>

      <main className="flex-1 p-6 max-w-md mx-auto w-full z-10 flex flex-col items-center justify-center gap-8">
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-md border border-coral-100"
            >
              <div className="w-20 h-20 bg-coral-100 rounded-full flex items-center justify-center mb-6">
                 <AlertTriangle size={40} className="text-coral-600" />
              </div>
              <h2 className="text-xl font-bold text-coral-800 mb-2">قاعدة الـ 15 الطبية</h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                تناول <strong>15 جرام</strong> من الكربوهيدرات سريعة الامتصاص فوراً (مثل: نصف كوب عصير تفاح، أو 3 تمرات، أو ملعقة طعام عسل).
              </p>

              {!timerActive ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={startTimer}
                  className="w-full bg-coral-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-coral-700 shadow-md transition-colors"
                >
                  <Clock size={20} />
                  تناولت الكربوهيدرات - ابدأ المؤقت
                </motion.button>
              ) : (
                <div className="w-full">
                  <div className="bg-coral-50 border border-coral-200 rounded-2xl p-6 text-center">
                    <span className="text-sm font-bold text-coral-700 block mb-2">انتظر لمدة 15 دقيقة...</span>
                    <span className="text-5xl font-black text-coral-600 tabular-nums font-mono tracking-tighter">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-md border border-coral-100"
            >
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 size={40} className="text-teal-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">حان وقت الفحص!</h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                يرجى قياس مستوى السكر في الدم الآن.
              </p>

              <div className="w-full flex flex-col gap-3">
                 <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    السكر ارتفع لأكثر من {settings.lowBgLimit} (ممتاز)
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={resetProcess}
                    className="w-full bg-white border-2 border-coral-500 text-coral-600 font-bold py-4 rounded-2xl hover:bg-coral-50 transition-colors"
                  >
                    السكر لا يزال أقل من {settings.lowBgLimit} (إعادة القاعدة)
                  </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};
