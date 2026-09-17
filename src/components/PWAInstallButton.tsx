import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-50 text-teal-700 px-4 py-3 text-sm font-bold shadow-sm hover:bg-teal-100 transition mt-4"
      >
        <Download size={18} />
        تثبيت التطبيق
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-50 text-teal-700 px-4 py-3 text-sm font-bold shadow-sm hover:bg-teal-100 transition mt-4"
        >
          <Download size={18} />
          تثبيت التطبيق (iOS)
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl relative text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-2">تثبيت على الآيفون / الآيباد</h3>
              <p className="mt-2 text-sm text-slate-600 mb-6 leading-relaxed">
                اضغط على زر المشاركة <Share className="inline w-4 h-4 mx-1" /> في الأسفل، ثم قم بالتمرير للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية</strong> <PlusSquare className="inline w-4 h-4 mx-1" />.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
