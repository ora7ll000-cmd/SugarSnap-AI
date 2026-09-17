import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider, useAppContext } from './store';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Scan } from './pages/Scan';
import { Result } from './pages/Result';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { MealDetail } from './pages/MealDetail';
import { HypoAssistant } from './pages/HypoAssistant';
import { Reports } from './pages/Reports';
import { Lifestyle } from './pages/Lifestyle';
import { AnimatePresence, motion } from 'motion/react';
import { Navigation } from './components/Navigation';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, authLoading, settings } = useAppContext();
  
  if (authLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!settings.isConfigured && window.location.pathname !== '/settings') {
     return <Navigate to="/settings" replace />;
  }
  
  return <>{children}</>;
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="w-full min-h-[100dvh] bg-slate-50"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {/* @ts-expect-error - Routes does not explicitly accept key in types but AnimatePresence requires it */}
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <PageTransition><Dashboard /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/scan" element={
          <PrivateRoute>
            <PageTransition><Scan /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/result" element={
          <PrivateRoute>
            <PageTransition><Result /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/history" element={
          <PrivateRoute>
            <PageTransition><History /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/history/:id" element={
          <PrivateRoute>
            <PageTransition><MealDetail /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute>
            <PageTransition><Reports /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/hypo" element={
          <PrivateRoute>
            <PageTransition><HypoAssistant /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/lifestyle" element={
          <PrivateRoute>
            <PageTransition><Lifestyle /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <PageTransition><Settings /></PageTransition>
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const MainLayout = () => {
  const { user, settings } = useAppContext();
  
  return (
    <>
      <AnimatedRoutes />
      {/* Only show navigation if logged in AND setup is complete */}
      {user && settings.isConfigured && <Navigation />}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-center" dir="rtl" />
        <MainLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
