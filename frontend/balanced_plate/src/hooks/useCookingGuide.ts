import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';
import type { CookingGuide } from '@/api/types';

/**
 * Generate an AI-powered cooking guide for a given dish.
 */
export const useGenerateCookingGuide = () => {
  return useMutation<CookingGuide, Error, string>({
    mutationFn: async (dishName: string) => {
      const { data } = await api.post('/cooking/generate/', {
        dish_name: dishName,
      });
      return data.data ?? data;
    },
  });
};
