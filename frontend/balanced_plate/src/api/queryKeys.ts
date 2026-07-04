export type FoodAnalysesParams = {
  userId?: number;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
};

export const queryKeys = {
  currentUser: ['currentUser'] as const,
  foodAnalyses: {
    all: ['foodAnalyses'] as const,
    list: (params: FoodAnalysesParams = {}) =>
      [...queryKeys.foodAnalyses.all, params] as const,
  },
  nutrition: {
    all: ['nutrition'] as const,
    analytics: (userId: number, dateRange: string) =>
      [...queryKeys.nutrition.all, 'analytics', userId, dateRange] as const,
    foodGroups: (userId: number, range: string) =>
      [...queryKeys.nutrition.all, 'foodGroups', userId, range] as const,
    foodGroupPercentages: (userId: number, range: string) =>
      [...queryKeys.nutrition.all, 'foodGroupPercentages', userId, range] as const,
    balanceScore: (userId: number, range: string) =>
      [...queryKeys.nutrition.all, 'balanceScore', userId, range] as const,
    mealTiming: (userId: number, range: string) =>
      [...queryKeys.nutrition.all, 'mealTiming', userId, range] as const,
    recommendations: (userId: number, limit: number) =>
      [...queryKeys.nutrition.all, 'recommendations', userId, limit] as const,
  },
  healthReport: {
    all: ['healthReport'] as const,
    analyses: (userId: number, limit: number) =>
      [...queryKeys.healthReport.all, 'analyses', userId, limit] as const,
    recommendations: (userId: number, limit: number) =>
      [...queryKeys.healthReport.all, 'recommendations', userId, limit] as const,
    foodGroups: (userId: number) =>
      [...queryKeys.healthReport.all, 'foodGroups', userId] as const,
    balance: (userId: number) =>
      [...queryKeys.healthReport.all, 'balance', userId] as const,
  },
  billing: {
    all: ['billing'] as const,
    plans: () => [...queryKeys.billing.all, 'plans'] as const,
    subscription: () => [...queryKeys.billing.all, 'subscription'] as const,
    usage: () => [...queryKeys.billing.all, 'usage'] as const,
  },
};
