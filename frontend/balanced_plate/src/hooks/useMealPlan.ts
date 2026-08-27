import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import type {
  BudgetTier,
  MealPlan,
  GenerateMealPlanRequest,
  GenerateDayMealPlanRequest,
  UpsertMealEntryRequest,
} from '@/api/types';

const MEAL_PLANS_KEY = ['mealPlans'] as const;

interface BudgetTiersResponse {
  tiers: BudgetTier[];
  household_size: number;
  price_area: { id: number; name: string; state: string } | null;
}

/**
 * Budget presets with the naira figure each works out to for this household size.
 * Keeps the tier amounts on the server so they can be retuned as food prices move,
 * rather than hardcoded in the UI.
 */
export const useBudgetTiers = (householdSize: number) => {
  return useQuery<BudgetTiersResponse>({
    queryKey: ['budgetTiers', householdSize],
    queryFn: async () => {
      const { data } = await api.get('/pricing/budget-tiers/', {
        params: { household_size: householdSize },
      });
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
};

/**
 * Fetch all meal plans
 */
export const useMealPlans = () => {
  return useQuery<MealPlan[]>({
    queryKey: MEAL_PLANS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/meal-plans/');
      return Array.isArray(data) ? data : data.results ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single meal plan by ID
 */
export const useMealPlan = (id: number | null) => {
  return useQuery<MealPlan>({
    queryKey: [...MEAL_PLANS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get(`/meal-plans/${id}/`);
      return data;
    },
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Generate a new AI meal plan
 */
export const useGenerateMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<MealPlan, Error, GenerateMealPlanRequest>({
    mutationFn: async (request) => {
      const { data } = await api.post('/meal-plans/generate/', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};

/**
 * Generate AI meals for a single day without replacing the rest of the week.
 */
export const useGenerateDayMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<MealPlan, Error, GenerateDayMealPlanRequest>({
    mutationFn: async (request) => {
      const { data } = await api.post('/meal-plans/generate-day/', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};

/**
 * Create or update one manually managed meal entry.
 */
export const useUpsertMealEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<MealPlan, Error, UpsertMealEntryRequest>({
    mutationFn: async (request) => {
      const { data } = await api.post('/meal-plans/entries/', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};

/**
 * Delete a single meal entry.
 */
export const useDeleteMealEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/meal-plans/entries/${id}/delete/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};

/**
 * Delete a meal plan
 */
export const useDeleteMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await api.delete(`/meal-plans/${id}/delete/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};
