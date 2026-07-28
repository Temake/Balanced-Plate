import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import { queryKeys } from '@/api/queryKeys';
import { isPaymentRequiredError } from '@/utils/billing';
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
  recentAnalyses: FoodAnalysis[];
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

// Compute trend based on current value vs target
const computeTrend = (value: number, target: number): 'up' | 'down' | 'stable' => {
  const ratio = target > 0 ? value / target : 0;
  if (ratio >= 0.9) return 'up';      // meeting or exceeding target
  if (ratio < 0.5) return 'down';     // well below target
  return 'stable';                     // on track
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

  const calorieValue = Math.round(
    (foodGroupData?.total_carbs_grams || 0) * 4 + 
    (foodGroupData?.total_protein_grams || 0) * 4 + 
    (foodGroupData?.total_fat_grams || 0) * 9
  );
  const proteinValue = foodGroupData?.total_protein_grams || 0;
  const carbsValue = foodGroupData?.total_carbs_grams || 0;
  const fatsValue = foodGroupData?.total_fat_grams || 0;

  return {
    calories: {
      value: calorieValue,
      target: targets.calories,
      trend: computeTrend(calorieValue, targets.calories)
    },
    protein: {
      value: proteinValue,
      target: targets.protein,
      trend: computeTrend(proteinValue, targets.protein)
    },
    carbs: {
      value: carbsValue,
      target: targets.carbs,
      trend: computeTrend(carbsValue, targets.carbs)
    },
    fats: {
      value: fatsValue,
      target: targets.fats,
      trend: computeTrend(fatsValue, targets.fats)
    }
  };
};

// Calculate weekly score from balance data and real analysis count
const calculateWeeklyScore = (
  balanceData: WeeklyBalanceData[], 
  analysesCount: number = 0
): WeeklyScoreData => {
  const scores = balanceData.map(d => d.balance).filter(s => s > 0);
  const currentScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 0;
  
  const streak = scores.filter(s => s >= 70).length;
  const bestDayIdx = scores.length > 0 ? scores.indexOf(Math.max(...scores)) : -1;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Days with data = days that had at least one analysis (score > 0)
  const daysWithData = scores.length;
  const goalsMet = scores.filter(s => s >= 80).length;
  
  return {
    currentScore,
    // Previous score: use 0 when no real comparison data exists
    // (a proper implementation would fetch previous week's average)
    previousScore: 0,
    streak,
    bestDay: bestDayIdx >= 0 ? days[bestDayIdx] : 'N/A',
    totalMealsAnalyzed: analysesCount,
    goalsMet,
    totalGoals: Math.max(daysWithData, 1),
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
    if (analysis.actionable_suggestion) {
      recommendations.push({
        id: `action-${analysis.id}`,
        title: 'Recommended Next Step',
        description: analysis.actionable_suggestion,
        type: 'tip' as const,
        priority: 'high' as const,
      });
    }

    if (analysis.alternative_suggestion) {
      recommendations.push({
        id: `alternative-${analysis.id}`,
        title: 'Suggested Swap',
        description: analysis.alternative_suggestion,
        type: 'balance' as const,
        priority: 'medium' as const,
      });
    }

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
  all: queryKeys.nutrition.all,
  analytics: queryKeys.nutrition.analytics,
  foodGroups: queryKeys.nutrition.foodGroups,
  balanceScore: queryKeys.nutrition.balanceScore,
  weeklyRecommendations: () => [...queryKeys.nutrition.all, 'recommendations'] as const,
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

const buildAnalyticsData = (
  foodGroupsData: any,
  distributionData: any,
  balanceScoreData: any,
  mealTimingData: any,
  analysesData: FoodAnalysis[],
  weeklyRecsData: WeeklyRecommendation[],
  dateRange: DateRange,
): NutritionAnalyticsData => {
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
    weeklyScore: calculateWeeklyScore(transformedWeeklyBalance, analysesData.length),
    recommendations,
    timingRecommendations,
    weeklyRecommendations: weeklyRecsData,
    recentAnalyses: analysesData,
  };
};

const getRangeParam = (dateRange: DateRange): string => {
  if (dateRange === 'week') return 'week';
  if (dateRange === 'month') return 'month';
  if (dateRange === 'today') return 'today';
  return 'all';
};

export const useNutritionAnalytics = (dateRange: DateRange = 'week') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || 0;
  const enabled = !!userId;
  const rangeParam = getRangeParam(dateRange);
  const dateParams = getDateRangeParams(dateRange);

  const foodGroupsQuery = useQuery({
    queryKey: queryKeys.nutrition.foodGroups(userId, rangeParam),
    queryFn: async () => {
      const { data } = await api.get(`/analytics/nutrition/${userId}/food-group-grams/`, {
        params: { range: rangeParam },
      });
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
  });

  const distributionQuery = useQuery({
    queryKey: queryKeys.nutrition.foodGroupPercentages(userId, rangeParam),
    queryFn: async () => {
      const { data } = await api.get(`/analytics/nutrition/${userId}/food-group-percentage/`, {
        params: { range: rangeParam },
      });
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const balanceScoreQuery = useQuery({
    queryKey: queryKeys.nutrition.balanceScore(userId, rangeParam),
    queryFn: async () => {
      const { data } = await api.get(`/analytics/nutrition/${userId}/daily-balance-score/`, {
        params: { range: rangeParam },
      });
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const mealTimingQuery = useQuery({
    queryKey: queryKeys.nutrition.mealTiming(userId, rangeParam),
    queryFn: async () => {
      const { data } = await api.get('/analytics/meal-timing/', {
        params: { range: rangeParam },
      });
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const analysesQuery = useQuery({
    queryKey: queryKeys.foodAnalyses.list({ userId, limit: 20, ...dateParams }),
    queryFn: async () => {
      const { data } = await api.get('/results/', {
        params: { limit: 20, ...dateParams },
      });
      return data.results || data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // The only paid query in this hook. Free accounts get a 402 here and still see
  // every chart below, so its failure is kept out of the shared error state.
  const weeklyRecsQuery = useQuery({
    queryKey: queryKeys.nutrition.recommendations(userId, 5),
    queryFn: async () => {
      const { data } = await api.get('/recommendations/', {
        params: { limit: 5 },
      });
      return data.results || data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount, error) => !isPaymentRequiredError(error) && failureCount < 1,
  });

  const data = buildAnalyticsData(
    foodGroupsQuery.data ?? null,
    distributionQuery.data ?? null,
    balanceScoreQuery.data ?? null,
    mealTimingQuery.data ?? null,
    analysesQuery.data ?? [],
    weeklyRecsQuery.data ?? [],
    dateRange,
  );

  const isLoading =
    foodGroupsQuery.isLoading ||
    distributionQuery.isLoading ||
    balanceScoreQuery.isLoading ||
    mealTimingQuery.isLoading ||
    analysesQuery.isLoading ||
    weeklyRecsQuery.isLoading;

  // Analytics is free, so only the free queries feed the dashboard error banner.
  // A recommendations failure is reported separately and must never gate the charts.
  const error =
    foodGroupsQuery.error ||
    distributionQuery.error ||
    balanceScoreQuery.error ||
    mealTimingQuery.error ||
    analysesQuery.error;

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.foodAnalyses.all });
  };

  return {
    data: enabled ? data : null,
    isLoading,
    error: error?.message || null,
    isReportsPaymentRequired: isPaymentRequiredError(weeklyRecsQuery.error),
    refetch
  };
};

export default useNutritionAnalytics;
