import React, { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useAppContext } from '../store';
import { toast } from 'sonner';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const MealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { history, removeMeal, settings } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);

  const meal = history.find((m) => m.id === id);

  if (!meal) {
    return <Navigate to="/history" replace />;
  }

  const { icr, isf } = settings;

  const handleConfirmDelete = async () => {
    await removeMeal(meal.id);
    toast.success('تم حذف الوجبة');
    navigate('/history');
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(d);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative overflow-hidden pb-32">
      {/* Decorative background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full bg-teal-100/40 blur-3xl" />

      <main className="flex-1 p-6 max-w-md mx-auto w-full z-10 flex flex-col gap-6 pt-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-slate-800">تفاصيل الوجبة</h1>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-coral-100 text-coral-500 hover:bg-coral-50 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-mint-400" />
          <h2 className="text-sm font-medium text-slate-500 mb-2">جرعة الإنسولين الكلية</h2>

          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-6xl font-black tracking-tight text-teal-600">
              {meal.totalDose}
            </span>
            <span className="text-xl font-bold text-slate-400">وحدة</span>
          </div>

          {meal.image && (
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                <img src={meal.image} alt="Meal" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {meal.mealDescription}
          </p>

          <p className="text-[10px] text-slate-400 mt-4">{formatDate(meal.timestamp)}</p>
        </motion.div>

        {/* Details Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-4">التفاصيل والحسابات</h3>

          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm">وزن الوجبة</span>
            <span className="font-bold text-slate-800">{meal.weightGrams}g</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm">الكربوهيدرات الصافية</span>
            <span className="font-bold text-slate-800">{Math.round(meal.netCarbs)}g</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm">جرعة الوجبة (ICR: {icr})</span>
            <span className="font-bold text-slate-800">{meal.mealBolus} وحدة</span>
          </div>
          {(meal.currentBg !== undefined || meal.correctionBolus > 0) && (
            <>
              {meal.currentBg !== undefined && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">مستوى السكر المسجل</span>
                  <span className="font-bold text-slate-800">{meal.currentBg} mg/dL</span>
                </div>
              )}
              {meal.correctionBolus > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500 text-sm">جرعة التصحيح (ISF: {isf})</span>
                  <span className="font-bold text-slate-800">{meal.correctionBolus} وحدة</span>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={showConfirm}
        title="حذف الوجبة"
        message="هل أنت متأكد من رغبتنك في حذف هذه الوجبة؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};
