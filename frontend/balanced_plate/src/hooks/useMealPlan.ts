import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { ACCESS_TOKEN } from '@/api/constants';
import type {
  BudgetTier,
  MealPlan,
  MealEntry,
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

export interface StreamProgress {
  day: string;
  completed_days: number;
  total_days: number;
}

/**
 * Progressively generate an AI meal plan via Server-Sent Events (SSE).
 * Populates days into React Query cache in real time as they complete.
 */
export const useGenerateMealPlanStream = () => {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState<StreamProgress | null>(null);

  const generateStream = async (
    request: GenerateMealPlanRequest,
    options?: {
      onSuccess?: (plan: MealPlan) => void;
      onError?: (error: Error) => void;
      onDayProgress?: (day: string, entries: MealEntry[], progress: StreamProgress) => void;
    }
  ) => {
    setIsStreaming(true);
    setProgress({ day: '', completed_days: 0, total_days: 7 });

    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/meal-plans/generate-stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {
          // not json
        }
        const error = new Error(errData?.message || errData?.detail || `HTTP Error ${response.status}`);
        (error as any).status = response.status;
        (error as any).response = { status: response.status, data: errData };
        throw error;
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalPlan: MealPlan | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.trim()) continue;
          const lines = part.split('\n');
          let eventType = '';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.replace('data:', '').trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === 'day') {
              const currentProgress: StreamProgress = {
                day: data.day,
                completed_days: data.completed_days,
                total_days: data.total_days,
              };
              setProgress(currentProgress);

              // Update React Query's cache so the UI renders the day's meals immediately!
              queryClient.setQueryData<MealPlan[]>(MEAL_PLANS_KEY, (oldPlans) => {
                if (!oldPlans) return oldPlans;
                return oldPlans.map((plan) => {
                  if (plan.week_start_date === request.week_start_date) {
                    const otherEntries = (plan.entries || []).filter(
                      (e) => e.day.toLowerCase() !== data.day.toLowerCase()
                    );
                    return {
                      ...plan,
                      entries: [...otherEntries, ...data.entries],
                    };
                  }
                  return plan;
                });
              });

              options?.onDayProgress?.(data.day, data.entries, currentProgress);
            } else if (eventType === 'complete') {
              finalPlan = data.meal_plan;
              queryClient.setQueryData<MealPlan[]>(MEAL_PLANS_KEY, (oldPlans) => {
                if (!oldPlans) return [finalPlan!];
                const exists = oldPlans.some((p) => p.id === finalPlan!.id);
                if (exists) {
                  return oldPlans.map((p) => (p.id === finalPlan!.id ? finalPlan! : p));
                }
                return [finalPlan!, ...oldPlans];
              });
            } else if (eventType === 'error') {
              throw new Error(data.message || 'Stream generation failed');
            }
          } catch (parseErr) {
            console.error('Error parsing SSE event:', parseErr);
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
      if (finalPlan) {
        options?.onSuccess?.(finalPlan);
      }
    } catch (err: any) {
      options?.onError?.(err);
      throw err;
    } finally {
      setIsStreaming(false);
      setProgress(null);
    }
  };

  return {
    generateStream,
    isStreaming,
    progress,
  };
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

/**
 * Fetch all active price areas
 */
export const usePriceAreas = () => {
  return useQuery<import('@/api/types').PriceArea[]>({
    queryKey: ['priceAreas'],
    queryFn: async () => {
      const { data } = await api.get('/pricing/areas/');
      return data;
    },
    staleTime: 60 * 60 * 1000,
  });
};

/**
 * Resolve price area by GPS coordinates or explicit selection
 */
export const useLocatePriceArea = () => {
  const queryClient = useQueryClient();

  return useMutation<
    import('@/api/types').LocatePriceAreaResponse,
    Error,
    import('@/api/types').LocatePriceAreaRequest
  >({
    mutationFn: async (request) => {
      const { data } = await api.post('/pricing/locate/', request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetTiers'] });
      queryClient.invalidateQueries({ queryKey: MEAL_PLANS_KEY });
    },
  });
};

