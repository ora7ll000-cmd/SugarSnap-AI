import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Activity, Apple, Dumbbell, Droplet } from 'lucide-react';

export const Lifestyle = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col pb-32">
      <main className="flex-1 p-6 max-w-md mx-auto w-full space-y-6 pt-12">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">نظام صحي وتمارين</h1>
        
        {/* Intro */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">دليلك لحياة صحية</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            التحكم بالسكر لا يقتصر على الإنسولين فقط. الغذاء المتوازن والنشاط البدني هما مفتاحك لاستقرار القراءات وتجنب التذبذب.
          </p>
        </div>

        {/* Exercises Section */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
            <Dumbbell className="text-teal-500" size={20} />
            تمارين لخفض وتقليل الإنسولين
          </h3>
          
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-mint-400">
              <h4 className="font-bold text-slate-800 text-sm mb-1">المشي بعد الوجبات (10-15 دقيقة)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                ممارسة المشي الخفيف بعد الأكل مباشرة يقلل من ارتفاع السكر الحاد بنسبة تصل إلى 30%. ممتاز جداً بعد الوجبات الغنية بالكربوهيدرات.
              </p>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 border-r-4 border-r-teal-500">
              <h4 className="font-bold text-slate-800 text-sm mb-1">تمارين المقاومة والأوزان</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                بناء العضلات يزيد من حساسية الجسم للإنسولين على المدى الطويل. يفضل ممارستها 3 مرات أسبوعياً. (احرص على قياس السكر قبلها لتفادي الهبوط).
              </p>
            </motion.div>
          </div>
        </section>

        {/* Diet Plan Section */}
        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 mt-8">
            <Apple className="text-coral-500" size={20} />
            نظام أكل صحي ممتاز
          </h3>
          
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-3">
              <div className="w-2 h-full bg-coral-400 rounded-full" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">القاعدة الذهبية (طبق هارفارد)</h4>
                <p className="text-[10px] text-slate-500 mt-1">قسم طبقك بهذه الطريقة في كل وجبة رئيسية</p>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex gap-3 items-start">
                <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold flex items-center justify-center shrink-0 text-xs">50%</span>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1">خضروات غير نشوية (ألياف)</h5>
                  <p className="text-[10px] text-slate-500">سلطة خضراء، بروكلي، كوسة. تبطئ امتصاص السكر وتشبع بسرعة.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <span className="w-8 h-8 rounded-full bg-coral-100 text-coral-600 font-bold flex items-center justify-center shrink-0 text-xs">25%</span>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1">بروتين صحي</h5>
                  <p className="text-[10px] text-slate-500">دجاج مشوي، سمك، بيض، بقوليات. تمنع الارتفاع المفاجئ للسكر.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold flex items-center justify-center shrink-0 text-xs">25%</span>
                <div>
                  <h5 className="font-bold text-slate-800 text-xs mb-1">كربوهيدرات معقدة</h5>
                  <p className="text-[10px] text-slate-500">شوفان، خبز بر، أرز أسمر، كينوا. بديلة للسكريات البيضاء السريعة.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hydration */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 mt-6">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <Droplet className="text-blue-500" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-blue-800 text-sm mb-1">شرب الماء</h4>
            <p className="text-xs text-blue-600/80 leading-relaxed">
              تأكد من شرب لترين من الماء يومياً. الجفاف يرفع من تركيز السكر في الدم ويجعل مقاومة الإنسولين أعلى.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
