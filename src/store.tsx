import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserSettings, MealRecord, FavoriteMeal, BasalLog } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';

interface AppContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  history: MealRecord[];
  addMeal: (meal: Omit<MealRecord, 'id'>) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  
  favorites: FavoriteMeal[];
  addFavorite: (favorite: Omit<FavoriteMeal, 'id'>) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  
  basalLogs: BasalLog[];
  addBasalLog: (log: Omit<BasalLog, 'id'>) => Promise<void>;
  removeBasalLog: (id: string) => Promise<void>;

  // Computed Properties
  activeInsulin: number; // IOB
  estimatedA1c: number | null;

  tempResult: any;
  setTempResult: (data: any) => void;
  user: User | null;
  authLoading: boolean;
}

const defaultSettings: UserSettings = {
  icr: 10,
  isf: 50,
  targetBg: 100,
  lowBgLimit: 70,
  highBgLimit: 180,
  isConfigured: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [history, setHistory] = useState<MealRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [basalLogs, setBasalLogs] = useState<BasalLog[]>([]);
  
  const [tempResult, setTempResult] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          return;
        }

        if (userDoc.exists()) {
          const data = userDoc.data() as any;
          setSettings({
            ...defaultSettings,
            ...data
          });
        } else {
          const defaultData = {
            ...defaultSettings,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          try {
            await setDoc(userRef, defaultData);
            setSettings(defaultSettings);
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}`);
          }
        }
      } else {
        setSettings(defaultSettings);
        setHistory([]);
        setFavorites([]);
        setBasalLogs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync History
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'meals'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: MealRecord[] = [];
      snapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() } as MealRecord));
      setHistory(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/meals`);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Favorites
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'favorites'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: FavoriteMeal[] = [];
      snapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() } as FavoriteMeal));
      setFavorites(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/favorites`);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Basal Logs
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'basalLogs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records: BasalLog[] = [];
      snapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() } as BasalLog));
      setBasalLogs(records);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/basalLogs`);
    });
    return () => unsubscribe();
  }, [user]);

  // Calculations
  const activeInsulin = useMemo(() => {
    // Simple linear decay over 4 hours
    const DURATION_MS = 4 * 60 * 60 * 1000; 
    const now = new Date().getTime();
    
    return history.reduce((total, meal) => {
      if (!meal.totalDose || meal.totalDose <= 0) return total;
      const mealTime = new Date(meal.timestamp).getTime();
      const elapsed = now - mealTime;
      
      if (elapsed >= 0 && elapsed < DURATION_MS) {
        const remainingPercentage = 1 - (elapsed / DURATION_MS);
        return total + (meal.totalDose * remainingPercentage);
      }
      return total;
    }, 0);
  }, [history]);

  const estimatedA1c = useMemo(() => {
    const recordsWithBg = history.filter(h => h.currentBg && h.currentBg > 0);
    // If not enough records, fall back to user-provided lastA1c or return null
    if (recordsWithBg.length < 3) return settings.lastA1c || null;
    
    const sum = recordsWithBg.reduce((acc, curr) => acc + (curr.currentBg || 0), 0);
    const avgBg = sum / recordsWithBg.length;
    // Formula: eAG = 28.7 * A1c - 46.7  => A1c = (eAG + 46.7) / 28.7
    const a1c = (avgBg + 46.7) / 28.7;
    return Math.round(a1c * 10) / 10;
  }, [history, settings.lastA1c]);

  // API Methods
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const payload: any = { ...newSettings, updatedAt: serverTimestamp() };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      await updateDoc(userRef, payload);
      setSettings({ ...settings, ...newSettings });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addMeal = async (meal: Omit<MealRecord, 'id'>) => {
    if (!user) return;
    try {
      const mealRef = doc(collection(db, 'users', user.uid, 'meals'));
      const payload = { ...meal, createdAt: serverTimestamp() };
      Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);
      await setDoc(mealRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/meals`);
    }
  };

  const removeMeal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'meals', id));
  };

  const addFavorite = async (favorite: Omit<FavoriteMeal, 'id'>) => {
    if (!user) return;
    const favRef = doc(collection(db, 'users', user.uid, 'favorites'));
    await setDoc(favRef, { ...favorite, createdAt: serverTimestamp() });
  };

  const removeFavorite = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'favorites', id));
  };

  const addBasalLog = async (log: Omit<BasalLog, 'id'>) => {
    if (!user) return;
    const basalRef = doc(collection(db, 'users', user.uid, 'basalLogs'));
    await setDoc(basalRef, { ...log, createdAt: serverTimestamp() });
  };

  const removeBasalLog = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'basalLogs', id));
  };

  return (
    <AppContext.Provider value={{ 
      settings, updateSettings, 
      history, addMeal, removeMeal, 
      favorites, addFavorite, removeFavorite,
      basalLogs, addBasalLog, removeBasalLog,
      activeInsulin, estimatedA1c,
      tempResult, setTempResult, user, authLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

