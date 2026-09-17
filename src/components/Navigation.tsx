import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, Settings, Camera } from 'lucide-react';
import { motion } from 'motion/react';

export const Navigation = () => {
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-3xl shadow-lg border border-slate-100 flex justify-between items-center px-4 py-2 z-50">
      
      {/* Dashboard */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 w-14 transition-colors ${
            isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
          <LayoutDashboard size={22} strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium">الرئيسية</span>
        </motion.div>
      </NavLink>

      {/* Favorites (Previously History) */}
      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 w-14 transition-colors ${
            isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
          <Clock size={22} strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium">السجل</span>
        </motion.div>
      </NavLink>

      {/* Scan Prominent Button */}
      <NavLink
        to="/scan"
        className="relative -top-5"
      >
        <motion.div 
          whileTap={{ scale: 0.9 }} 
          className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-500/30 border-[4px] border-slate-50"
        >
          <Camera size={24} />
        </motion.div>
      </NavLink>

      {/* Reports (Replaces Scan spot) */}
      <NavLink
        to="/reports"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 w-14 transition-colors ${
            isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          <span className="text-[10px] mt-1 font-medium">التقارير</span>
        </motion.div>
      </NavLink>

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 w-14 transition-colors ${
            isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
          }`
        }
      >
        <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
          <Settings size={22} strokeWidth={2} />
          <span className="text-[10px] mt-1 font-medium">إعدادات</span>
        </motion.div>
      </NavLink>

    </nav>
  );
};
