import axios from 'axios';

export const isPaymentRequiredError = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 402;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
};
