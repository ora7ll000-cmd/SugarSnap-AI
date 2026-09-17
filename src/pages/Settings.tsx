import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Save, Info, User, Activity, Bot, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../store';
import { toast } from 'sonner';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';

export const Settings = () => {
  const { settings, updateSettings, user } = useAppContext();
  const navigate = useNavigate();

  const [icr, setIcr] = useState(settings.icr?.toString() || '');
  const [isf, setIsf] = useState(settings.isf?.toString() || '');
  const [targetBg, setTargetBg] = useState(settings.targetBg?.toString() || '');
  
  // New Settings
  const [lastA1c, setLastA1c] = useState(settings.lastA1c?.toString() || '');
  const [lowBgLimit, setLowBgLimit] = useState(settings.lowBgLimit?.toString() || '70');
  const [highBgLimit, setHighBgLimit] = useState(settings.highBgLimit?.toString() || '180');

  // AI Settings
  const initialAiSettings = JSON.parse(localStorage.getItem('aiSettings') || '{}');
  const [useCustomKey, setUseCustomKey] = useState(initialAiSettings.useCustomKey || false);
  const [apiKey, setApiKey] = useState(initialAiSettings.apiKey || '');
  const [model, setModel] = useState(initialAiSettings.model || 'gemini-3.8-flash');

  const [showInfoIcr, setShowInfoIcr] = useState(false);
  const [showInfoIsf, setShowInfoIsf] = useState(false);
  const [showInfoTarget, setShowInfoTarget] = useState(false);

  // Accordion states
  const [isMedicalOpen, setIsMedicalOpen] = useState(true);
  const [isTargetsOpen, setIsTargetsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const handleSave = () => {
    const numIcr = parseFloat(icr);
    const numIsf = parseFloat(isf);
    const numTarget = parseFloat(targetBg);
    
    const numLastA1c = lastA1c ? parseFloat(lastA1c) : undefined;
    const numLow = parseFloat(lowBgLimit);
    const numHigh = parseFloat(highBgLimit);

    if (isNaN(numIcr) || isNaN(numIsf) || isNaN(numTarget) || isNaN(numLow) || isNaN(numHigh)) {
      toast.error('الرجاء إدخال أرقام صحيحة');
      return;
    }

    if (useCustomKey && !apiKey.trim()) {
      toast.error('الرجاء إدخال مفتاح API صحيح أو استخدام المفتاح الافتراضي');
      return;
    }

    // Save AI Settings to local storage (client-side only)
    localStorage.setItem('aiSettings', JSON.stringify({
      useCustomKey,
      apiKey: apiKey.trim(),
      model,
    }));

    updateSettings({
      icr: numIcr,
      isf: numIsf,
      targetBg: numTarget,
      lastA1c: numLastA1c,
      lowBgLimit: numLow,
      highBgLimit: numHigh,
      isConfigured: true,
    });
    
    toast.success('تم حفظ الإعدادات بنجاح');
    if (!settings.isConfigured) {
      navigate('/scan');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 pb-32">
      <main className="p-4 max-w-md mx-auto space-y-4 pt-12">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {settings.isConfigured ? 'الإعدادات' : 'إعداد الحساب'}
        </h1>
        
        {/* User Profile Section */}
        {user && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={24} className="text-slate-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-slate-800 truncate">{user.displayName || 'مستخدم السكر الذكي'}</h2>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        {/* Medical Parameters */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setIsMedicalOpen(!isMedicalOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">المعاملات الطبية</h2>
                <p className="text-[10px] text-slate-500">حسابات الإنسولين الأساسية</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              {isMedicalOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {isMedicalOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-4 pt-3">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                      <span>معامل الكربوهيدرات (ICR)</span>
                      <button onClick={(e) => { e.stopPropagation(); setShowInfoIcr(!showInfoIcr); }} className="text-slate-400 hover:text-teal-600 transition-colors">
                        <Info size={16} />
                      </button>
                    </label>
                    
                    <AnimatePresence>
                      {showInfoIcr && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <p className="text-teal-700 text-[10px] mb-3 leading-relaxed">
                            كل 1 وحدة من الإنسولين تغطي كم جرام من الكربوهيدرات؟
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <input
                        type="number"
                        value={icr}
                        onChange={(e) => setIcr(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition-colors font-bold"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">g/U</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                      <span>معامل الحساسية (ISF)</span>
                      <button onClick={(e) => { e.stopPropagation(); setShowInfoIsf(!showInfoIsf); }} className="text-slate-400 hover:text-teal-600 transition-colors">
                        <Info size={16} />
                      </button>
                    </label>

                    <AnimatePresence>
                      {showInfoIsf && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <p className="text-teal-700 text-[10px] mb-3 leading-relaxed">
                            كل 1 وحدة إنسولين تخفض مستوى السكر بمقدار كم؟
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <input
                        type="number"
                        value={isf}
                        onChange={(e) => setIsf(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-teal-500 transition-colors font-bold"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">mg/dL</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Targets & History */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setIsTargetsOpen(!isTargetsOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">الأهداف والحدود</h2>
                <p className="text-[10px] text-slate-500">مستويات السكر المستهدفة والتراكمي</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              {isTargetsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {isTargetsOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-4 pt-3">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <label className="block text-xs font-bold text-slate-700 mb-2">الهدف (Target)</label>
                       <div className="relative">
                          <input type="number" value={targetBg} onChange={(e) => setTargetBg(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-bold text-sm" />
                       </div>
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <label className="block text-xs font-bold text-slate-700 mb-2">آخر تراكمي</label>
                       <div className="relative">
                          <input type="number" step="0.1" value={lastA1c} onChange={(e) => setLastA1c(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-bold text-sm" />
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 bg-coral-50/50 p-3 rounded-2xl border border-white">
                       <label className="block text-xs font-bold text-coral-700 mb-2">حد الهبوط</label>
                       <div className="relative">
                          <input type="number" value={lowBgLimit} onChange={(e) => setLowBgLimit(e.target.value)} className="w-full bg-white border border-coral-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-coral-500 font-bold text-sm" />
                       </div>
                    </div>
                    <div className="flex-1 bg-yellow-50/50 p-3 rounded-2xl border border-white">
                       <label className="block text-xs font-bold text-yellow-700 mb-2">حد الارتفاع</label>
                       <div className="relative">
                          <input type="number" value={highBgLimit} onChange={(e) => setHighBgLimit(e.target.value)} className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-yellow-500 font-bold text-sm" />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div 
            className="flex items-center justify-between mb-2 cursor-pointer"
            onClick={() => setIsAiOpen(!isAiOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">الذكاء الاصطناعي</h2>
                <p className="text-[10px] text-slate-500">إعدادات نماذج ومفاتيح AI</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              {isAiOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {isAiOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-3 pt-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${!useCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <input type="radio" name="ai_key_source" checked={!useCustomKey} onChange={() => setUseCustomKey(false)} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">مفتاح النظام (الافتراضي)</span>
                      <span className="text-[10px] text-slate-500">مقدم من مطور التطبيق</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${useCustomKey ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <input type="radio" name="ai_key_source" checked={useCustomKey} onChange={() => setUseCustomKey(true)} className="w-4 h-4 text-purple-600 focus:ring-purple-500" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">مفتاحي الخاص</span>
                      <span className="text-[10px] text-slate-500">استخدم API Key الخاص بك</span>
                    </div>
                  </label>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2">النموذج (Model)</label>
                    <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-500 transition-colors text-sm">
                      <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                      <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                      <option value="gemini-3.6-flash">Gemini 3.6 Flash</option>
                      <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                      <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite</option>
                      <option value="gemini-3.0-flash">Gemini 3 Flash</option>
                      <option value="gemini-3.1-pro">Gemini 3.1 Pro</option>
                    </select>
                  </div>

                  <AnimatePresence>
                    {useCustomKey && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden pt-2">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <label className="block text-xs font-bold text-slate-700 mb-2">مفتاح Gemini API</label>
                          <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..." className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-purple-500 transition-colors text-sm" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="w-full bg-teal-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Save size={20} />
            {settings.isConfigured ? 'حفظ التغييرات' : 'حفظ والبدء'}
          </motion.button>

          {settings.isConfigured && <PWAInstallButton />}
          
          {settings.isConfigured && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => auth.signOut()}
              className="w-full bg-white border border-coral-200 text-coral-600 font-bold py-4 rounded-2xl flex items-center justify-center hover:bg-coral-50 transition-colors"
            >
              تسجيل الخروج
            </motion.button>
          )}
        </div>

        <div className="bg-slate-100 rounded-2xl p-4 mt-8 text-center">
          <Info className="text-slate-400 mx-auto mb-2" size={20} />
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
            تأكد دائماً من صحة المعاملات الطبية واستشر طبيبك قبل تغييرها لتجنب مضاعفات السكري.
          </p>
        </div>

      </main>
    </div>
  );
};
