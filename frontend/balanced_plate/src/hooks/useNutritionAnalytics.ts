import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import type { DateRange } from '@/components/dashboard/DateRangeFilter';
import type { Recommendation } from '@/components/dashboard/RecommendationsPanel';
import type { 
  FoodGroupData, 
  WeeklyBalanceData, 
  MealTimingData 
} from '@/components/dashboard/AnalyticsSection';
import type { FoodAnalysis, WeeklyRecommendation } from '@/api/types';

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
  mealTiming: MealTimingData[];
  weeklyScore: WeeklyScoreData;
  recommendations: Recommendation[];
  timingRecommendations: string[];
  weeklyRecommendations: WeeklyRecommendation[];
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

// Transform weekly balance data (normalize scores from 0-1 to 0-100)
const transformWeeklyBalance = (data: any, dateRange: DateRange): WeeklyBalanceData[] => {
  if (!data) return [];
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get day names based on actual current week
  const getDayLabel = (dayIndex: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };
  
  // For 'today' filter, just return today's data
  if (dateRange === 'today') {
    const todayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    const rawScore = data[`${todayName}_balance`] || 0;
    const normalizedScore = rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore;
    return [{
      day: getDayLabel(dayOfWeek),
      balance: Math.round(normalizedScore),
      target: 80
    }];
  }
  
  // For week view, show Monday to today (or full week if viewing historical)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Map dayOfWeek (0=Sun) to our array index (0=Mon)
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  return days.map((day, idx) => {
    const rawScore = data[`${day}_balance`] || 0;
    // Normalize: if score is between 0-1, multiply by 100
    const normalizedScore = rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore;
    
    // For week view, mark future days differently
    const isFutureDay = dateRange === 'week' && idx > todayIndex;
    
    return {
      day: shortDays[idx],
      balance: isFutureDay ? 0 : Math.round(normalizedScore),
      target: 80
    };
  });
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

// Extract timing recommendations from food analyses
const extractTimingRecommendations = (analyses: FoodAnalysis[]): string[] => {
  const allTimingRecs: string[] = [];
  for (const analysis of analyses) {
    const timingRecs = analysis.next_meal_recommendations?.timing_recommendations || [];
    allTimingRecs.push(...timingRecs);
  }
  // Remove duplicates and return latest 5
  return [...new Set(allTimingRecs)].slice(0, 5);
};

// Transform food analysis to recommendations
const transformAnalysesToRecommendations = (analyses: FoodAnalysis[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  for (const analysis of analyses.slice(0, 5)) {
    const nutritionalRecs = analysis.next_meal_recommendations?.nutritional_recommendations || [];
    const balanceRecs = analysis.next_meal_recommendations?.balance_improvements || [];
    
    // Add nutritional recommendations
    nutritionalRecs.forEach((rec, idx) => {
      recommendations.push({
        id: `nutritional-${analysis.id}-${idx}`,
        title: 'Nutritional Tip',
        description: rec,
        type: 'diet' as const,
        priority: 'medium' as const,
      });
    });
    
    // Add balance improvement recommendations
    balanceRecs.forEach((rec, idx) => {
      recommendations.push({
        id: `balance-${analysis.id}-${idx}`,
        title: 'Balance Improvement',
        description: rec,
        type: 'balance' as const,
        priority: 'high' as const,
      });
    });
  }
  
  return recommendations.slice(0, 10); // Return max 10 recommendations
};

// Transform weekly recommendations to panel recommendations format
const transformWeeklyRecsToRecommendations = (weeklyRecs: WeeklyRecommendation[]): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  for (const weeklyRec of weeklyRecs.slice(0, 3)) {
    // Add priority actions as high-priority recommendations
    weeklyRec.priority_actions?.forEach((action, idx) => {
      recommendations.push({
        id: `weekly-priority-${weeklyRec.id}-${idx}`,
        title: 'Priority Action',
        description: action,
        type: 'warning' as const,
        priority: 'high' as const,
      });
    });
    
    // Add weekly goals as medium-priority recommendations
    weeklyRec.weekly_goals?.forEach((goal, idx) => {
      recommendations.push({
        id: `weekly-goal-${weeklyRec.id}-${idx}`,
        title: 'Weekly Goal',
        description: goal,
        type: 'tip' as const,
        priority: 'medium' as const,
      });
    });
  }
  
  return recommendations.slice(0, 10);
};

// Query keys for React Query
export const nutritionQueryKeys = {
  all: ['nutrition'] as const,
  analytics: (userId: number, dateRange: DateRange) => [...nutritionQueryKeys.all, 'analytics', userId, dateRange] as const,
  foodGroups: (userId: number) => [...nutritionQueryKeys.all, 'foodGroups', userId] as const,
  balanceScore: (userId: number) => [...nutritionQueryKeys.all, 'balanceScore', userId] as const,
  analyses: (dateRange: DateRange) => [...nutritionQueryKeys.all, 'analyses', dateRange] as const,
  weeklyRecommendations: () => [...nutritionQueryKeys.all, 'weeklyRecommendations'] as const,
};

// Get date range parameters for API calls
const getDateRangeParams = (dateRange: DateRange): { start_date?: string; end_date?: string } => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  switch (dateRange) {
    case 'today':
      return { start_date: formatDate(today), end_date: formatDate(today) };
    case 'week': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      return { start_date: formatDate(startOfWeek), end_date: formatDate(today) };
    }
    case 'month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start_date: formatDate(startOfMonth), end_date: formatDate(today) };
    }
    case 'all':
    default:
      return {};
  }
};

// Fetch all analytics data
const fetchAnalyticsData = async (userId: number, dateRange: DateRange): Promise<NutritionAnalyticsData> => {
  // Map frontend date range to backend 'range' parameter
  const rangeParam = dateRange === 'week' ? 'week' : dateRange === 'month' ? 'month' : dateRange === 'today' ? 'today' : 'all';
  
  // Get date params for filtering analyses
  const dateParams = getDateRangeParams(dateRange);
  
  // Fetch all analytics data in parallel
  const [foodGroupsRes, distributionRes, balanceScoreRes, mealTimingRes, analysesRes, weeklyRecsRes] = 
    await Promise.allSettled([
      api.get(`/analytics/nutrition/${userId}/food-group-grams/`, { params: { range: rangeParam } }),
      api.get(`/analytics/nutrition/${userId}/food-group-percentage/`, { params: { range: rangeParam } }),
      api.get(`/analytics/nutrition/${userId}/daily-balance-score/`, { params: { range: rangeParam } }),
      api.get('/analytics/meal-timing/', { params: { range: rangeParam } }),
      api.get('/results/', { params: { page_size: 10, ...dateParams } }),
      api.get('/recommendations/', { params: { page_size: 5 } }),
    ]);

  // Extract successful responses or use null
  const foodGroupsData = foodGroupsRes.status === 'fulfilled' ? foodGroupsRes.value.data : null;
  const distributionData = distributionRes.status === 'fulfilled' ? distributionRes.value.data : null;
  const balanceScoreData = balanceScoreRes.status === 'fulfilled' ? balanceScoreRes.value.data : null;
  const mealTimingData = mealTimingRes.status === 'fulfilled' ? mealTimingRes.value.data : null;
  const analysesData: FoodAnalysis[] = analysesRes.status === 'fulfilled' 
    ? (analysesRes.value.data.results || analysesRes.value.data || [])
    : [];
  const weeklyRecsData: WeeklyRecommendation[] = weeklyRecsRes.status === 'fulfilled'
    ? (weeklyRecsRes.value.data.results || weeklyRecsRes.value.data || [])
    : [];

  // Transform data
  const transformedFoodGroups = transformFoodGroupData(foodGroupsData).length > 0 
    ? transformFoodGroupData(foodGroupsData) 
    : transformDistributionData(distributionData);
  const transformedWeeklyBalance = transformWeeklyBalance(balanceScoreData, dateRange);
  const transformedMealTiming = transformMealTiming(mealTimingData);
  const timingRecommendations = extractTimingRecommendations(analysesData);
  
  // Get analysis-based recommendations
  const analysisRecommendations = transformAnalysesToRecommendations(analysesData);
  
  // Get weekly recommendations as fallback
  const weeklyRecommendations = transformWeeklyRecsToRecommendations(weeklyRecsData);
  
  // Combine: use analysis recs if available, otherwise use weekly recs
  // For "today" or "week" filters, prefer analysis-based if available
  const recommendations = analysisRecommendations.length > 0 
    ? analysisRecommendations 
    : weeklyRecommendations;

  return {
    summary: calculateSummary(foodGroupsData),
    foodGroups: transformedFoodGroups,
    weeklyBalance: transformedWeeklyBalance,
    mealTiming: transformedMealTiming,
    weeklyScore: calculateWeeklyScore(transformedWeeklyBalance),
    recommendations,
    timingRecommendations,
    weeklyRecommendations: weeklyRecsData,
  };
};

export const useNutritionAnalytics = (dateRange: DateRange = 'week') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: nutritionQueryKeys.analytics(user?.id || 0, dateRange),
    queryFn: () => fetchAnalyticsData(user!.id, dateRange),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: nutritionQueryKeys.analytics(user?.id || 0, dateRange) });
  };

  return { 
    data: query.data || null, 
    isLoading: query.isLoading, 
    error: query.error?.message || null, 
    refetch 
  };
};

export default useNutritionAnalytics;
