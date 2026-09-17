export interface UserSettings {
  icr: number; // Insulin to Carb Ratio (grams per unit)
  isf: number; // Insulin Sensitivity Factor (mg/dL per unit)
  targetBg: number; // Target Blood Glucose (mg/dL)
  name?: string;
  isConfigured: boolean;
  lastA1c?: number; // Manual entry for last lab HbA1c
  lowBgLimit: number; // Low threshold, default 70
  highBgLimit: number; // High threshold, default 180
}

export interface MealRecord {
  id: string;
  timestamp: string; // ISO Date String
  image?: string; // Base64 data URL
  mealDescription: string;
  weightGrams: number;
  netCarbs: number;
  mealBolus: number;
  correctionBolus: number;
  totalDose: number;
  currentBg?: number;
  isExerciseMode?: boolean; // Applied 30% reduction for example
  isEstimatedWeight?: boolean; // Indicates if the weight was AI estimated
}

export interface FavoriteMeal {
  id: string;
  mealDescription: string;
  netCarbsPer100g: number;
  image?: string;
}

export interface BasalLog {
  id: string;
  timestamp: string; // ISO string
  dose: number;
}
