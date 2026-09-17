import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Printer, Share2, Calendar, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export const Reports = () => {
  const navigate = useNavigate();
  const { history, settings, activeInsulin, estimatedA1c } = useAppContext();

  // Prepare chart data (last 30 entries)
  const chartData = history
    .filter(h => h.currentBg !== undefined)
    .slice(0, 30) // Take last 30 entries
    .map(h => {
      const d = new Date(h.timestamp);
      return {
        time: `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`,
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        bg: h.currentBg,
        fullDate: d
      };
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Calculate TIR (Time in Range)
  const bgReadings = history.filter(h => h.currentBg && h.currentBg > 0).map(h => h.currentBg as number);
  const totalReadings = bgReadings.length;
  
  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;

  bgReadings.forEach(bg => {
    if (bg < settings.lowBgLimit) lowCount++;
    else if (bg > settings.highBgLimit) highCount++;
    else inRangeCount++;
  });

  const lowPercent = totalReadings > 0 ? Math.round((lowCount / totalReadings) * 100) : 0;
  const inRangePercent = totalReadings > 0 ? Math.round((inRangeCount / totalReadings) * 100) : 0;
  const highPercent = totalReadings > 0 ? Math.round((highCount / totalReadings) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = '\uFEFF'; // BOM for UTF-8 Arabic support in Excel
    csv += 'التاريخ,الوقت,مستوى السكر (mg/dL),الوجبة,الكربوهيدرات (جم),جرعة الطعام,جرعة التصحيح,الجرعة الكلية\n';
    
    const allRecords = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    allRecords.forEach(record => {
      const d = new Date(record.timestamp);
      const date = d.toLocaleDateString('ar-SA');
      const time = `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
      const bg = record.currentBg || '';
      const meal = record.mealDescription ? `"${record.mealDescription.replace(/"/g, '""')}"` : '';
      const carbs = record.netCarbs || '';
      const mealBolus = record.mealBolus || '';
      const correctionBolus = record.correctionBolus || '';
      const totalDose = record.totalDose || '';
      
      csv += `${date},${time},${bg},${meal},${carbs},${mealBolus},${correctionBolus},${totalDose}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_السكري_${new Date().toLocaleDateString('ar-SA')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative pb-32 print:bg-white print:pb-0">
      
      {/* Print Header */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 mb-2">تقرير متابعة مرض السكري</h1>
        <p className="text-sm font-bold text-slate-600">اسم المريض: {settings.name || 'غير مسجل'}</p>
        <p className="text-sm text-slate-500">تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
      </div>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full z-10 flex flex-col gap-6 print:p-0 print:max-w-none pt-12">
        
        {/* Actions */}
        <div className="flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-slate-800">التقارير الطبية</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
              title="تصدير لملف Excel (CSV)"
            >
              <FileText size={18} />
            </button>
            <button
              onClick={handlePrint}
              className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-100 transition-colors shadow-sm"
              title="طباعة التقرير"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 gap-4 print:grid-cols-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <span className="text-sm font-bold text-slate-500 block mb-1">ICR معامل الكربوهيدرات</span>
            <span className="text-2xl font-black text-teal-600">{settings.icr}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <span className="text-sm font-bold text-slate-500 block mb-1">ISF معامل الحساسية</span>
            <span className="text-2xl font-black text-teal-600">{settings.isf}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <span className="text-sm font-bold text-slate-500 block mb-1">التراكمي المتوقع</span>
            <span className="text-2xl font-black text-coral-500">{estimatedA1c ? estimatedA1c.toFixed(1) + '%' : '--'}</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
             <span className="text-sm font-bold text-slate-500 block mb-1">الهدف (Target BG)</span>
             <span className="text-2xl font-black text-slate-700">{settings.targetBg}</span>
          </div>
        </div>

        {/* Chart & TIR */}
        {chartData.length > 0 ? (
          <div className="space-y-6">
            
            {/* Time in Range (TIR) */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 print:break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-teal-500"/> 
                الوقت في النطاق المستهدف (Time in Range)
              </h3>
              
              <div className="w-full h-4 rounded-full flex overflow-hidden mb-3">
                {lowPercent > 0 && <div style={{ width: `${lowPercent}%` }} className="bg-coral-500 h-full" />}
                {inRangePercent > 0 && <div style={{ width: `${inRangePercent}%` }} className="bg-teal-500 h-full" />}
                {highPercent > 0 && <div style={{ width: `${highPercent}%` }} className="bg-yellow-400 h-full" />}
              </div>
              
              <div className="flex justify-between items-center text-xs font-bold">
                <div className="text-coral-600 text-center">
                  <span className="block text-[10px] text-slate-500 mb-0.5">منخفض (&lt;{settings.lowBgLimit})</span>
                  {lowPercent}%
                </div>
                <div className="text-teal-600 text-center">
                  <span className="block text-[10px] text-slate-500 mb-0.5">في النطاق</span>
                  {inRangePercent}%
                </div>
                <div className="text-yellow-600 text-center">
                  <span className="block text-[10px] text-slate-500 mb-0.5">مرتفع (&gt;{settings.highBgLimit})</span>
                  {highPercent}%
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 print:break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity size={18} className="text-teal-500"/> 
                تدرج مستويات السكر (آخر 30 قراءة)
              </h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <ReferenceLine y={settings.highBgLimit} stroke="#facc15" strokeDasharray="3 3" opacity={0.5} />
                    <ReferenceLine y={settings.targetBg} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                    <ReferenceLine y={settings.lowBgLimit} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
                    <Line 
                      type="monotone" 
                      dataKey="bg" 
                      name="السكر"
                      stroke="#0d9488" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#fff', stroke: '#0d9488', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#0d9488', stroke: '#ccfbf1', strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-50" />
                  <span className="text-[10px] text-slate-500 font-bold">حد الارتفاع ({settings.highBgLimit})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500 opacity-50" />
                  <span className="text-[10px] text-slate-500 font-bold">الهدف ({settings.targetBg})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-coral-500 opacity-50" />
                  <span className="text-[10px] text-slate-500 font-bold">حد الهبوط ({settings.lowBgLimit})</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="font-medium text-sm text-center">لا توجد قراءات كافية لرسم الرسم البياني.<br/>قم بتسجيل وجبات ومستويات السكر لتظهر هنا.</p>
          </div>
        )}

        {/* Action Call for Printing */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handlePrint}
          className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-700 shadow-md transition-colors print:hidden mt-4"
        >
          <Printer size={20} />
          طباعة أو حفظ التقرير PDF للطبيب
        </motion.button>
        
      </main>
    </div>
  );
};
