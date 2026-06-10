import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import type { MealPlan, GenerateMealPlanRequest } from '@/api/types';

const MEAL_PLANS_KEY = ['mealPlans'] as const;

/**
 * Fetch all meal plans
 */
export const useMealPlans = () => {
  return useQuery<MealPlan[]>({
    queryKey: MEAL_PLANS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/api/meal-plans/');
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
      const { data } = await api.get(`/api/meal-plans/${id}/`);
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
      const { data } = await api.post('/api/meal-plans/generate/', request);
      return data;
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
      await api.delete(`/api/meal-plans/${id}/delete/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};
