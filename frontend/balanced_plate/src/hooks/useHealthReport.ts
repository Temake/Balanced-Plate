import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axios';
import type {
  FoodAnalysis,
  PaginatedResponse,
  WeeklyRecommendation,
  FoodGroupGramsResponse,
  DailyBalanceScoreResponse,
} from '@/api/types';

// ─── Derived types ───

export interface TopFood {
  name: string;
  count: number;
}

export interface MealTypeCount {
  type: string;
  count: number;
  color: string;
}

export interface HealthFlag {
  id: string;
  title: string;
  description: string;
  severity: 'warning' | 'danger';
  icon: string; // lucide icon name hint
  value?: string;
}

export interface DayScore {
  day: string;
  shortDay: string;
  score: number | null;
}

export interface HealthReportData {
  // Raw query data
  analyses: FoodAnalysis[];
  latestRecommendation: WeeklyRecommendation | null;
  foodGroups: FoodGroupGramsResponse | null;
  dailyScores: DailyBalanceScoreResponse | null;

  // Computed metrics
  totalMealsLogged: number;
  daysTracked: number;
  averageBalanceScore: number;
  consistencyStreak: number;
  mostCommonFoods: TopFood[];
  mealTypeCounts: MealTypeCount[];
  weeklyScores: DayScore[];
  healthFlags: HealthFlag[];
}

// ─── Helpers ───

const MEAL_TYPE_COLORS: Record<string, string> = {
  Breakfast: '#f59e0b',
  Lunch: '#3b82f6',
  Dinner: '#8b5cf6',
  Snack: '#10b981',
};

const DAY_KEYS: { key: keyof DailyBalanceScoreResponse; day: string; short: string }[] = [
  { key: 'monday', day: 'Monday', short: 'Mon' },
  { key: 'tuesday', day: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', day: 'Wednesday', short: 'Wed' },
  { key: 'thursday', day: 'Thursday', short: 'Thu' },
  { key: 'friday', day: 'Friday', short: 'Fri' },
  { key: 'saturday', day: 'Saturday', short: 'Sat' },
  { key: 'sunday', day: 'Sunday', short: 'Sun' },
];

function computeTopFoods(analyses: FoodAnalysis[], limit = 5): TopFood[] {
  const freq = new Map<string, number>();
  for (const a of analyses) {
    const name = a.food_name?.trim();
    if (!name) continue;
    freq.set(name, (freq.get(name) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function computeMealTypes(analyses: FoodAnalysis[]): MealTypeCount[] {
  const counts: Record<string, number> = {};
  for (const a of analyses) {
    const type = a.meal_type || 'Snack';
    counts[type] = (counts[type] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      color: MEAL_TYPE_COLORS[type] || '#6b7280',
    }))
    .sort((a, b) => b.count - a.count);
}

function computeWeeklyScores(data: DailyBalanceScoreResponse | null): DayScore[] {
  return DAY_KEYS.map(({ key, day, short }) => {
    const raw = data ? data[key] : null;
    // Normalise: if value is between 0-1, scale to 0-100
    const score = raw !== null && raw !== undefined
      ? (raw > 0 && raw <= 1 ? Math.round(raw * 100) : Math.round(raw))
      : null;
    return { day, shortDay: short, score };
  });
}

function computeConsistencyStreak(scores: DayScore[]): number {
  // Count consecutive days (from most recent tracked day backwards) with score >= 50
  let streak = 0;
  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i].score !== null && scores[i].score! >= 50) {
      streak++;
    } else if (scores[i].score !== null) {
      break; // streak broken
    }
    // null (no data) — skip without breaking
  }
  return streak;
}

function computeHealthFlags(
  foodGroups: FoodGroupGramsResponse | null,
  analyses: FoodAnalysis[],
  healthConditions: string[],
): HealthFlag[] {
  const flags: HealthFlag[] = [];
  const conditions = healthConditions.map(c => c.toLowerCase());

  // Diabetes: flag high carbs
  if (conditions.some(c => c.includes('diabet'))) {
    const carbGrams = foodGroups?.total_carbs_grams ?? 0;
    if (carbGrams > 300) {
      flags.push({
        id: 'high-carbs-diabetes',
        title: 'Carb Intake Alert',
        description: `Your weekly carb intake is ${Math.round(carbGrams)}g. Consider reducing refined carbs to help manage blood sugar levels.`,
        severity: carbGrams > 450 ? 'danger' : 'warning',
        icon: 'Wheat',
        value: `${Math.round(carbGrams)}g`,
      });
    }
  }

  // Hypertension: flag potential salt-heavy meals
  if (conditions.some(c => c.includes('hypertension') || c.includes('blood pressure'))) {
    // Heuristic: high-calorie meals tend to be saltier
    const highCalMeals = analyses.filter(a => parseFloat(a.total_calories || '0') > 800).length;
    if (highCalMeals > 3) {
      flags.push({
        id: 'salt-heavy',
        title: 'Potential Salt-Heavy Meals',
        description: `${highCalMeals} meals this week were high-calorie, which often correlates with higher sodium. Monitor salt intake closely.`,
        severity: highCalMeals > 5 ? 'danger' : 'warning',
        icon: 'Droplets',
        value: `${highCalMeals} meals`,
      });
    }
  }

  // Keto: track carb levels
  if (conditions.some(c => c.includes('keto'))) {
    const carbGrams = foodGroups?.total_carbs_grams ?? 0;
    const dailyAvg = carbGrams / 7;
    flags.push({
      id: 'keto-carbs',
      title: 'Daily Carb Estimate',
      description: `Your estimated daily carb average is ${Math.round(dailyAvg)}g. ${dailyAvg > 50 ? 'This is above the typical keto threshold of 20-50g/day.' : 'Great — you\'re within keto range!'}`,
      severity: dailyAvg > 50 ? 'warning' : 'warning',
      icon: 'Zap',
      value: `~${Math.round(dailyAvg)}g/day`,
    });
  }

  // General: very low protein
  const proteinGrams = foodGroups?.total_protein_grams ?? 0;
  if (proteinGrams > 0 && proteinGrams < 100) {
    flags.push({
      id: 'low-protein',
      title: 'Low Protein Intake',
      description: `Only ${Math.round(proteinGrams)}g of protein this week. Aim for at least 350g weekly (~50g/day) for muscle maintenance.`,
      severity: proteinGrams < 70 ? 'danger' : 'warning',
      icon: 'Dumbbell',
      value: `${Math.round(proteinGrams)}g`,
    });
  }

  return flags;
}

// ─── Build text for clipboard ───

export function buildTextSummary(data: HealthReportData, userName?: string): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════');
  lines.push('  BALANCED PLATE — HEALTH REPORT');
  lines.push('═══════════════════════════════════');
  if (userName) lines.push(`Report for: ${userName}`);
  lines.push(`Generated: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  lines.push('');

  lines.push('📊 WEEKLY SUMMARY');
  lines.push(`  • Meals logged: ${data.totalMealsLogged}`);
  lines.push(`  • Days tracked: ${data.daysTracked}/7`);
  lines.push(`  • Avg balance score: ${data.averageBalanceScore}%`);
  lines.push(`  • Consistency streak: ${data.consistencyStreak} days`);
  lines.push('');

  if (data.mostCommonFoods.length > 0) {
    lines.push('🍽️ MOST COMMON FOODS');
    data.mostCommonFoods.forEach((f, i) => {
      lines.push(`  ${i + 1}. ${f.name} (×${f.count})`);
    });
    lines.push('');
  }

  if (data.mealTypeCounts.length > 0) {
    lines.push('🕐 MEAL TYPES');
    data.mealTypeCounts.forEach(m => {
      lines.push(`  • ${m.type}: ${m.count}`);
    });
    lines.push('');
  }

  if (data.foodGroups) {
    lines.push('🥗 NUTRITION OVERVIEW');
    lines.push(`  • Carbs: ${Math.round(data.foodGroups.total_carbs_grams)}g`);
    lines.push(`  • Protein: ${Math.round(data.foodGroups.total_protein_grams)}g`);
    lines.push(`  • Vegetables: ${Math.round(data.foodGroups.total_vegetable_grams)}g`);
    lines.push(`  • Fruits: ${Math.round(data.foodGroups.total_fruit_grams)}g`);
    lines.push(`  • Dairy: ${Math.round(data.foodGroups.total_dairy_grams)}g`);
    lines.push(`  • Fats: ${Math.round(data.foodGroups.total_fat_grams)}g`);
    lines.push('');
  }

  lines.push('📈 WEEKLY BALANCE TREND');
  data.weeklyScores.forEach(s => {
    const bar = s.score !== null ? `${'█'.repeat(Math.round(s.score / 10))} ${s.score}%` : '— no data';
    lines.push(`  ${s.shortDay}: ${bar}`);
  });
  lines.push('');

  if (data.healthFlags.length > 0) {
    lines.push('⚠️ HEALTH ALERTS');
    data.healthFlags.forEach(f => {
      lines.push(`  [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`);
    });
    lines.push('');
  }

  if (data.latestRecommendation) {
    const rec = data.latestRecommendation;
    if (rec.priority_actions?.length) {
      lines.push('🎯 PRIORITY ACTIONS');
      rec.priority_actions.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
      lines.push('');
    }
    if (rec.weekly_goals?.length) {
      lines.push('🏆 WEEKLY GOALS');
      rec.weekly_goals.forEach((g, i) => lines.push(`  ${i + 1}. ${g}`));
      lines.push('');
    }
  }

  lines.push('─────────────────────────────────');
  lines.push('Powered by Balanced Plate AI');
  return lines.join('\n');
}

// ─── Main hook ───

export const useHealthReport = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const analysesQuery = useQuery({
    queryKey: ['healthReportAnalyses'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<FoodAnalysis>>('/results/', {
        params: { limit: 50 },
      });
      return data.results ?? [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const recommendationsQuery = useQuery({
    queryKey: ['healthReportRecs'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<WeeklyRecommendation>>(
        '/recommendations/',
        { params: { limit: 1 } },
      );
      return data.results?.[0] ?? null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const foodGroupsQuery = useQuery({
    queryKey: ['healthReportFoodGroups'],
    queryFn: async () => {
      const { data } = await api.get<FoodGroupGramsResponse>(
        `/analytics/nutrition/${userId}/food-group-grams/`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const balanceScoresQuery = useQuery({
    queryKey: ['healthReportBalance'],
    queryFn: async () => {
      const { data } = await api.get<DailyBalanceScoreResponse>(
        `/analytics/nutrition/${userId}/daily-balance-score/`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // ─── Compute derived data ───
  const analyses = analysesQuery.data ?? [];
  const latestRecommendation = recommendationsQuery.data ?? null;
  const foodGroups = foodGroupsQuery.data ?? null;
  const dailyScores = balanceScoresQuery.data ?? null;

  const weeklyScores = computeWeeklyScores(dailyScores);
  const scoresWithData = weeklyScores.filter(s => s.score !== null);
  const averageBalanceScore =
    scoresWithData.length > 0
      ? Math.round(scoresWithData.reduce((sum, s) => sum + s.score!, 0) / scoresWithData.length)
      : 0;

  const daysTracked = scoresWithData.length;
  const consistencyStreak = computeConsistencyStreak(weeklyScores);
  const mostCommonFoods = computeTopFoods(analyses);
  const mealTypeCounts = computeMealTypes(analyses);
  const healthFlags = computeHealthFlags(
    foodGroups,
    analyses,
    user?.health_conditions ?? [],
  );

  const isLoading =
    analysesQuery.isLoading ||
    recommendationsQuery.isLoading ||
    foodGroupsQuery.isLoading ||
    balanceScoresQuery.isLoading;

  const reportData: HealthReportData = {
    analyses,
    latestRecommendation,
    foodGroups,
    dailyScores,
    totalMealsLogged: analyses.length,
    daysTracked,
    averageBalanceScore,
    consistencyStreak,
    mostCommonFoods,
    mealTypeCounts,
    weeklyScores,
    healthFlags,
  };

  return { data: reportData, isLoading, user };
};

export default useHealthReport;
