import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Star, Calculator, X, Clock, Plus, Droplet } from 'lucide-react';
import { useAppContext } from '../store';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

export const History = () => {
  const navigate = useNavigate();
  const { history, favorites, removeFavorite, setTempResult } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [favoriteToDelete, setFavoriteToDelete] = useState<string | null>(null);
  const [selectedFavorite, setSelectedFavorite] = useState<any | null>(null);
  const [weight, setWeight] = useState<string>('');

  const handleConfirmDelete = async () => {
    if (favoriteToDelete) {
      await removeFavorite(favoriteToDelete);
      toast.success('تم الحذف من المفضلة بنجاح');
      setFavoriteToDelete(null);
    }
  };

  const handleCalculateDose = () => {
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight <= 0) {
      toast.error('الرجاء إدخال وزن صحيح');
      return;
    }

    if (selectedFavorite) {
      const netCarbs = (selectedFavorite.netCarbsPer100g / 100) * numWeight;
      
      setTempResult({
        mealDescription: selectedFavorite.mealDescription,
        netCarbs: netCarbs,
        weight: numWeight,
        imageSrc: selectedFavorite.image,
        isEstimatedWeight: false
      });
      
      setSelectedFavorite(null);
      setWeight('');
      navigate('/result');
    }
  };

  // Group history by date
  const groupedHistory = history.reduce((acc, curr) => {
    const date = new Date(curr.timestamp).toLocaleDateString('ar-SA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(curr);
    return acc;
  }, {} as Record<string, typeof history>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => {
    return new Date(groupedHistory[b][0].timestamp).getTime() - new Date(groupedHistory[a][0].timestamp).getTime();
  });

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-32">
      <main className="p-4 max-w-md mx-auto pt-6">
        
        {/* Custom Tabs */}
        <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex gap-1 mb-6 relative z-10">
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Clock size={16} />
            سجل الوجبات
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'favorites' ? 'bg-yellow-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Star size={16} />
            المفضلة
          </button>
        </div>

        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-16 text-slate-400">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Clock size={40} className="text-slate-300" />
                </div>
                <p className="font-medium text-slate-500">لا يوجد سجل للوجبات</p>
                <p className="text-xs text-slate-400 mt-2">قم بمسح وحساب وجبتك الأولى</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 px-2 sticky top-2 z-10 bg-slate-50/80 backdrop-blur-sm py-1 w-max rounded-lg">
                    {date}
                  </h3>
                  {groupedHistory[date].map((meal) => (
                    <motion.div
                      key={meal.id}
                      onClick={() => navigate(`/history/${meal.id}`)}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                        {meal.image ? (
                          <img src={meal.image} alt={meal.mealDescription} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Clock size={24} />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{meal.mealDescription}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                            {new Date(meal.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{Math.round(meal.netCarbs)}g كارب • {meal.weightGrams}g وزن</p>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-1 rounded-md">
                            <Droplet size={10} className="fill-teal-700" />
                            {meal.totalDose} وحدة
                          </span>
                          {meal.currentBg && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md">
                              سكر: {meal.currentBg}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-16 text-slate-400">
                <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
                  <Star size={40} className="text-yellow-300" />
                </div>
                <p className="font-medium text-slate-500">لا توجد وجبات في المفضلة</p>
                <p className="text-xs text-slate-400 mt-2">احفظ وجباتك المكررة للوصول السريع لها</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {favorites.map((fav, index) => (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden relative group cursor-pointer"
                    onClick={() => setSelectedFavorite(fav)}
                    whileHover={{ y: -2 }}
                  >
                    <div className="w-full aspect-square bg-slate-100 relative">
                      {fav.image ? (
                        <img src={fav.image} alt={fav.mealDescription} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Star size={32} />
                        </div>
                      )}
                      {/* Delete button positioned absolute over the image */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavoriteToDelete(fav.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/30 hover:bg-coral-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight flex-1">
                        {fav.mealDescription}
                      </h3>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-block bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-100">
                          {Math.round(fav.netCarbsPer100g)}g لكل 100g
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Calculate Dose Modal */}
      <AnimatePresence>
        {selectedFavorite && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setSelectedFavorite(null)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-50 max-w-md mx-auto shadow-2xl pb-24"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calculator className="text-teal-500" size={20} />
                  حساب الجرعة
                </h3>
                <button 
                  onClick={() => setSelectedFavorite(null)}
                  className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex gap-4 items-center mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                  {selectedFavorite.image ? (
                    <img src={selectedFavorite.image} alt="Meal" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                       <Star size={24} className="text-slate-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800 line-clamp-2">{selectedFavorite.mealDescription}</p>
                  <p className="text-xs text-slate-500 mt-1">{Math.round(selectedFavorite.netCarbsPer100g)}g كربوهيدرات لكل 100 جرام</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">
                  كم جرام ستأكل من هذه الوجبة؟
                </label>
                <div className="relative flex items-center justify-center px-4">
                  <input 
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-teal-500 rounded-2xl py-4 text-3xl font-bold text-center outline-none transition-colors"
                  />
                  <span className="absolute left-8 text-slate-400 font-bold bg-slate-50 px-2">g</span>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleCalculateDose}
                className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl shadow-sm hover:bg-teal-700 transition-colors"
              >
                احسب الجرعة
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!favoriteToDelete}
        title="حذف من المفضلة"
        message="هل أنت متأكد من رغبتك في حذف هذه الوجبة من المفضلة؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => setFavoriteToDelete(null)}
      />
    </div>
  );
};
