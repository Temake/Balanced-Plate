import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import type { DateRange } from '@/components/dashboard/DateRangeFilter';
import type { Recommendation } from '@/components/dashboard/RecommendationsPanel';
import type { 
  FoodGroupData, 
  WeeklyBalanceData, 
  MicronutrientData, 
  MealTimingData 
} from '@/components/dashboard/AnalyticsSection';
import { mockRecommendations } from '@/components/dashboard/RecommendationsPanel';

interface NutrientData {
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

interface NutritionSummary {
  calories: NutrientData;
  protein: NutrientData;
  carbs: NutrientData;
  fats: NutrientData;
}

interface WeeklyScoreData {
  currentScore: number;
  previousScore: number;
  streak: number;
  bestDay: string;
  totalMealsAnalyzed: number;
  goalsMet: number;
  totalGoals: number;
}

export interface NutritionAnalyticsData {
  summary: NutritionSummary;
  foodGroups: FoodGroupData[];
  weeklyBalance: WeeklyBalanceData[];
  micronutrients: MicronutrientData[];
  mealTiming: MealTimingData[];
  weeklyScore: WeeklyScoreData;
  recommendations: Recommendation[];
}

// Color palette for food groups
const FOOD_GROUP_COLORS: Record<string, string> = {
  carbs: '#3b82f6',
  protein: '#10b981',
  vegetables: '#22c55e',
  fruits: '#f59e0b',
  dairy: '#8b5cf6',
  fats: '#ef4444'
};

// Transform backend food group data to frontend format
const transformFoodGroupData = (data: any): FoodGroupData[] => {
  if (!data) return [];
  
  const groups = [
    { key: 'total_carbs_grams', name: 'Carbs', color: FOOD_GROUP_COLORS.carbs },
    { key: 'total_protein_grams', name: 'Protein', color: FOOD_GROUP_COLORS.protein },
    { key: 'total_vegetable_grams', name: 'Vegetables', color: FOOD_GROUP_COLORS.vegetables },
    { key: 'total_fruit_grams', name: 'Fruits', color: FOOD_GROUP_COLORS.fruits },
    { key: 'total_dairy_grams', name: 'Dairy', color: FOOD_GROUP_COLORS.dairy },
    { key: 'total_fat_grams', name: 'Fats', color: FOOD_GROUP_COLORS.fats },
  ];

  const total = groups.reduce((sum, g) => sum + (data[g.key] || 0), 0);
  
  return groups
    .map(g => ({
      name: g.name,
      value: data[g.key] || 0,
      percentage: total > 0 ? Math.round((data[g.key] || 0) / total * 100) : 0,
      color: g.color
    }))
    .filter(g => g.value > 0);
};

// Transform backend percentage data
const transformDistributionData = (data: any): FoodGroupData[] => {
  if (!data) return [];
  
  return [
    { name: 'Carbs', value: data.carbs_percent || 0, percentage: data.carbs_percent || 0, color: FOOD_GROUP_COLORS.carbs },
    { name: 'Protein', value: data.protein_percent || 0, percentage: data.protein_percent || 0, color: FOOD_GROUP_COLORS.protein },
    { name: 'Vegetables', value: data.vegetable_percent || 0, percentage: data.vegetable_percent || 0, color: FOOD_GROUP_COLORS.vegetables },
    { name: 'Fruits', value: data.fruit_percent || 0, percentage: data.fruit_percent || 0, color: FOOD_GROUP_COLORS.fruits },
    { name: 'Dairy', value: data.dairy_percent || 0, percentage: data.dairy_percent || 0, color: FOOD_GROUP_COLORS.dairy },
  ].filter(g => g.value > 0);
};

// Transform weekly balance data
const transformWeeklyBalance = (data: any): WeeklyBalanceData[] => {
  if (!data) return [];
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return days.map((day, idx) => ({
    day: shortDays[idx],
    balance: Math.round(data[`${day}_balance`] || 0),
    target: 80
  }));
};

// Transform micronutrients data
const transformMicronutrients = (data: any): MicronutrientData[] => {
  if (!data?.micronutrients) return [];
  
  const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
  
  return data.micronutrients.map((item: any, idx: number) => ({
    name: item.name,
    current: item.value,
    recommended: item.value / (item.percent / 100) || 0,
    percentage: Math.round(item.percent),
    color: colors[idx % colors.length]
  }));
};

// Transform meal timing data
const transformMealTiming = (data: any): MealTimingData[] => {
  if (!data) return [];
  
  const hours = [];
  for (let h = 6; h <= 22; h++) {
    const key = `h${h.toString().padStart(2, '0')}_calories`;
    const hour = h <= 12 ? `${h} AM` : `${h - 12} PM`;
    hours.push({
      hour: h === 12 ? '12 PM' : hour,
      calories: Math.round(data[key] || 0),
      mealType: getMealType(h)
    });
  }
  return hours;
};

const getMealType = (hour: number): string => {
  if (hour >= 6 && hour <= 10) return 'Breakfast';
  if (hour >= 11 && hour <= 14) return 'Lunch';
  if (hour >= 17 && hour <= 21) return 'Dinner';
  return 'Snack';
};

// Calculate summary from food group data
const calculateSummary = (foodGroupData: any): NutritionSummary => {
  // Default targets (these could come from user profile settings)
  const targets = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fats: 65
  };

  return {
    calories: {
      value: Math.round((foodGroupData?.total_carbs_grams || 0) * 4 + 
                        (foodGroupData?.total_protein_grams || 0) * 4 + 
                        (foodGroupData?.total_fat_grams || 0) * 9),
      target: targets.calories,
      trend: 'stable' as const
    },
    protein: {
      value: foodGroupData?.total_protein_grams || 0,
      target: targets.protein,
      trend: 'up' as const
    },
    carbs: {
      value: foodGroupData?.total_carbs_grams || 0,
      target: targets.carbs,
      trend: 'stable' as const
    },
    fats: {
      value: foodGroupData?.total_fat_grams || 0,
      target: targets.fats,
      trend: 'down' as const
    }
  };
};

// Calculate weekly score from balance data
const calculateWeeklyScore = (balanceData: WeeklyBalanceData[]): WeeklyScoreData => {
  const scores = balanceData.map(d => d.balance).filter(s => s > 0);
  const currentScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;
  
  const streak = scores.filter(s => s >= 70).length;
  const bestDayIdx = scores.indexOf(Math.max(...scores));
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return {
    currentScore,
    previousScore: Math.max(currentScore - 6, 0),
    streak,
    bestDay: days[bestDayIdx] || 'Saturday',
    totalMealsAnalyzed: scores.length * 3,
    goalsMet: scores.filter(s => s >= 80).length,
    totalGoals: 7
  };
};

// Generate recommendations based on data (mock for now)
// TODO: Replace with backend recommendations when available
const generateRecommendations = (
  _micronutrients: MicronutrientData[], 
  _foodGroups: FoodGroupData[]
): Recommendation[] => {
  // For now, return mock recommendations
  // This will be replaced with backend recommendations later
  return mockRecommendations;
};

export const useNutritionAnalytics = (dateRange: DateRange = 'week') => {
  const { user } = useAuth();
  const [data, setData] = useState<NutritionAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [foodGroupsRes, distributionRes, balanceScoreRes, micronutrientsRes, mealTimingRes] = 
        await Promise.allSettled([
          api.get(`/analytics/nutrition/${user.id}/food-group-grams/`),
          api.get(`/analytics/nutrition/${user.id}/food-group-percentage/`),
          api.get(`/analytics/nutrition/${user.id}/daily-balance-score/`),
          api.get(`/analytics/micronutrients/${user.id}/`),
          api.get(`/analytics/meal-timing/${user.id}/`),
        ]);

      // Extract successful responses or use null
      const foodGroupsData = foodGroupsRes.status === 'fulfilled' ? foodGroupsRes.value.data : null;
      const distributionData = distributionRes.status === 'fulfilled' ? distributionRes.value.data : null;
      const balanceScoreData = balanceScoreRes.status === 'fulfilled' ? balanceScoreRes.value.data : null;
      const micronutrientsData = micronutrientsRes.status === 'fulfilled' ? micronutrientsRes.value.data : null;
      const mealTimingData = mealTimingRes.status === 'fulfilled' ? mealTimingRes.value.data : null;

      // Transform data
      const transformedFoodGroups = transformFoodGroupData(foodGroupsData) || transformDistributionData(distributionData);
      const transformedMicronutrients = transformMicronutrients(micronutrientsData);
      const transformedWeeklyBalance = transformWeeklyBalance(balanceScoreData);
      const transformedMealTiming = transformMealTiming(mealTimingData);

      setData({
        summary: calculateSummary(foodGroupsData),
        foodGroups: transformedFoodGroups,
        weeklyBalance: transformedWeeklyBalance,
        micronutrients: transformedMicronutrients,
        mealTiming: transformedMealTiming,
        weeklyScore: calculateWeeklyScore(transformedWeeklyBalance),
        recommendations: generateRecommendations(transformedMicronutrients, transformedFoodGroups),
      });
    } catch (err: any) {
      console.error('Failed to fetch nutrition analytics:', err);
      setError(err.message || 'Failed to load nutrition analytics');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchAnalytics 
  };
};

export default useNutritionAnalytics;
