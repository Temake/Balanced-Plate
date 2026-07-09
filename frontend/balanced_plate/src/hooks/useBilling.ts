import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { queryKeys } from '@/api/queryKeys';
import type {
  BillingPlan,
  BillingUsage,
  InitializePaymentResponse,
  Subscription,
} from '@/api/types';

export const DEMO_ACCESS_TOKEN_KEY = 'balanced_plate_demo_access_token';

export const useBillingPlans = () => {
  return useQuery<BillingPlan[]>({
    queryKey: queryKeys.billing.plans(),
    queryFn: async () => {
      const { data } = await api.get('/billing/plans/');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useCurrentSubscription = () => {
  return useQuery<Subscription>({
    queryKey: queryKeys.billing.subscription(),
    queryFn: async () => {
      const { data } = await api.get('/billing/subscription/');
      return data;
    },
    staleTime: 60 * 1000,
  });
};

export const useBillingUsage = () => {
  return useQuery<BillingUsage>({
    queryKey: queryKeys.billing.usage(),
    queryFn: async () => {
      const { data } = await api.get('/billing/usage/');
      return data;
    },
    staleTime: 60 * 1000,
  });
};

export const useInitializeBillingPayment = () => {
  return useMutation<InitializePaymentResponse, Error, 'plus' | 'pro'>({
    mutationFn: async (planKey) => {
      const { data } = await api.post('/billing/initialize/', { plan_key: planKey });
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.authorization_url;
    },
  });
};

export const useVerifyBillingPayment = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; subscription: Subscription }, Error, string>({
    mutationFn: async (reference) => {
      const { data } = await api.get('/billing/verify/', { params: { reference } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.healthReport.all });
    },
  });
};

export const useRedeemDemoAccessInvite = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; subscription: Subscription }, Error, string>({
    mutationFn: async (token) => {
      const { data } = await api.post('/billing/demo-invites/redeem/', { token });
      return data;
    },
    onSuccess: () => {
      localStorage.removeItem(DEMO_ACCESS_TOKEN_KEY);
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.healthReport.all });
    },
  });
};
