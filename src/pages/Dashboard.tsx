import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Droplet, HeartPulse, Stethoscope, ArrowRight, TrendingDown, Moon, Plus, Check } from 'lucide-react';
import { useAppContext } from '../store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { settings, activeInsulin, estimatedA1c, history, basalLogs, addBasalLog } = useAppContext();
  const navigate = useNavigate();
  const [showBasalModal, setShowBasalModal] = useState(false);
  const [basalDose, setBasalDose] = useState('');

  const getRecentBg = () => {
    const recordsWithBg = history.filter(h => h.currentBg !== undefined);
    return recordsWithBg.length > 0 ? recordsWithBg[0].currentBg : null;
  };

  const recentBg = getRecentBg();

  const handleLogBasal = () => {
    const dose = parseFloat(basalDose);
    if (!dose || dose <= 0) {
      toast.error('الرجاء إدخال جرعة صحيحة');
      return;
    }
    addBasalLog({ timestamp: new Date().toISOString(), dose });
    setBasalDose('');
    setShowBasalModal(false);
    toast.success('تم تسجيل الإنسولين القاعدي');
  };

  const hasLoggedBasalToday = () => {
    if (!basalLogs.length) return false;
    const today = new Date().toDateString();
    return basalLogs.some(log => new Date(log.timestamp).toDateString() === today);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-24">
      {/* Decorative background */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />

      <main className="p-6 max-w-md mx-auto w-full z-10 flex flex-col gap-4 relative pt-12">
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-teal-400" />
            <Droplet className="text-teal-500 mb-3" size={28} />
            <span className="text-3xl font-black text-slate-800 mb-1">
              {activeInsulin > 0 ? (Math.round(activeInsulin * 10) / 10).toFixed(1) : '0'}
            </span>
            <span className="text-xs font-bold text-slate-400">الإنسولين النشط (IOB)</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-coral-400" />
            <Activity className="text-coral-500 mb-3" size={28} />
            <span className="text-3xl font-black text-slate-800 mb-1">
              {estimatedA1c ? estimatedA1c.toFixed(1) : '--'}
            </span>
            <span className="text-xs font-bold text-slate-400">التراكمي المتوقع (%)</span>
          </motion.div>

        </div>

        {/* Current BG & Quick Action */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-2"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">آخر قراءة سكر مسجلة</h3>
              <p className="text-[10px] text-slate-400">تحديث من آخر وجبة تم تسجيلها</p>
            </div>
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
               <span className="text-2xl font-black text-slate-700">{recentBg || '--'}</span>
            </div>
          </div>

          <div className="flex gap-3">
             <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/scan')}
                className="flex-1 bg-teal-600 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700"
             >
                <Stethoscope size={16} />
                تسجيل وجبة جديدة
             </motion.button>
             <motion.button 
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/hypo')}
                className="bg-coral-50 text-coral-600 border border-coral-200 text-xs font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-coral-100"
             >
                <TrendingDown size={16} />
                علاج هبوط
             </motion.button>
          </div>
        </motion.div>

        {/* Basal Insulin Log */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 mt-2 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasLoggedBasalToday() ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-500'}`}>
              <Moon size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">الإنسولين المنظم (القاعدي)</h4>
              <p className="text-[10px] text-slate-400">{hasLoggedBasalToday() ? 'تم التسجيل اليوم' : 'لم يتم التسجيل اليوم'}</p>
            </div>
          </div>
          {!hasLoggedBasalToday() ? (
            <button onClick={() => setShowBasalModal(true)} className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100">
              <Plus size={16} />
            </button>
          ) : (
             <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
              <Check size={16} />
            </div>
          )}
        </motion.div>

        {/* Info Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-slate-100 rounded-2xl p-4 flex items-start gap-3 border border-slate-200 mt-2 cursor-pointer hover:bg-slate-200 transition-colors"
          onClick={() => navigate('/reports')}
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-slate-600">
            <HeartPulse size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 mb-1">عرض التقارير والرسوم البيانية</h4>
            <p className="text-xs text-slate-500">تابع استقرار مستوى السكر والجرعات وقم بمشاركتها مع طبيبك بسهولة.</p>
          </div>
          <ArrowRight className="text-slate-400 self-center" size={16} />
        </motion.div>

        {/* Lifestyle Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-mint-50 rounded-2xl p-4 flex items-start gap-3 border border-mint-200 mt-2 cursor-pointer hover:bg-mint-100 transition-colors"
          onClick={() => navigate('/lifestyle')}
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm text-teal-600">
            <Activity size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-teal-900 mb-1">دليلك الصحي والرياضي للسكري</h4>
            <p className="text-xs text-teal-700/80">تعرف على نظام الأكل الصحي وتمارين لخفض وتقليل جرعة الإنسولين بشكل آمن.</p>
          </div>
          <ArrowRight className="text-teal-400 self-center" size={16} />
        </motion.div>

      </main>

      {/* Basal Modal */}
      <AnimatePresence>
        {showBasalModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setShowBasalModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50 max-w-md mx-auto shadow-2xl pb-24"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Moon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  تسجيل الإنسولين القاعدي
                </h3>
                <p className="text-xs text-slate-500 max-w-[250px] mx-auto">
                  قم بتسجيل جرعتك اليومية من الإنسولين المنظم (مثل لانتوس أو تريسبا)
                </p>
              </div>
              
              <div className="mb-6 px-4">
                 <div className="relative flex items-center justify-center">
                   <input 
                     type="number"
                     value={basalDose}
                     onChange={e => setBasalDose(e.target.value)}
                     placeholder="0"
                     autoFocus
                     className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 text-center text-3xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                   />
                   <span className="absolute left-6 text-slate-400 font-bold text-sm bg-slate-50 px-2">وحدة</span>
                 </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleLogBasal}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors"
              >
                تأكيد التسجيل
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
