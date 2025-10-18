export interface NutritionIngredient {
  name: string;
  portion: string;
  portionGrams: number;
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export interface NutritionTotal {
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  imageUrl: string;
}

export interface HealthAnalysis {
  status: 'NORMAL' | 'WARNING' | 'CAUTION';
  alert: string; // Birinchi ustun: Ogohlantirish yoki asosiy xabar
  details: string; // Ikkinchi ustun: Nega yaxshi/yomon, tafsilotlar va tavsiyalar
}

export interface NutritionResult {
  ingredients: NutritionIngredient[];
  total: NutritionTotal;
  healthAnalysis?: HealthAnalysis;
  message?: string;
}
