import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  useBillingPlans,
  useBillingUsage,
  useCurrentSubscription,
  useInitializeBillingPayment,
} from '@/hooks/useBilling';
import { formatNaira, getApiErrorMessage } from '@/utils/billing';
import { cn } from '@/lib/utils';
import { Check, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { BillingPlan } from '@/api/types';

const fallbackPlans: BillingPlan[] = [
  {
    key: 'free',
    name: 'Free',
    description: 'Unlimited photo analysis, detailed analytics, and manual planning.',
    price_kobo: 0,
    price_naira: 0,
    currency: 'NGN',
    interval: 'monthly',
    ai_generation_limit: 0,
    analytics_enabled: false,
    reports_enabled: false,
    ai_planning_enabled: false,
    ai_cooking_enabled: false,
  },
  {
    key: 'plus',
    name: 'Plus',
    description: 'Weekly reports, AI meal planning, and AI cooking guide.',
    price_kobo: 240000,
    price_naira: 2400,
    currency: 'NGN',
    interval: 'monthly',
    ai_generation_limit: 30,
    analytics_enabled: true,
    reports_enabled: true,
    ai_planning_enabled: true,
    ai_cooking_enabled: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    description: 'Higher AI usage for regular planning and cooking support.',
    price_kobo: 450000,
    price_naira: 4500,
    currency: 'NGN',
    interval: 'monthly',
    ai_generation_limit: 100,
    analytics_enabled: true,
    reports_enabled: true,
    ai_planning_enabled: true,
    ai_cooking_enabled: true,
  },
] ;

const planFeatures = (plan: BillingPlan) => {
  // Detailed analytics is free on every plan, so it is listed unconditionally and
  // `analytics_enabled` is deliberately not read here.
  const features = ['Unlimited photo food analysis', 'Manual meal planning', 'Detailed analytics'];
  if (plan.reports_enabled) features.push('Weekly health reports');
  if (plan.ai_planning_enabled) features.push('AI meal planning');
  if (plan.ai_cooking_enabled) features.push('AI cooking guide');
  if (plan.ai_generation_limit > 0) features.push(`${plan.ai_generation_limit} AI credits/month`);
  return features;
};

const isPaidPlanKey = (key: BillingPlan['key']): key is 'plus' | 'pro' => {
  return key === 'plus' || key === 'pro';
};

const Billing: React.FC = () => {
  const { data: apiPlans, isLoading } = useBillingPlans();
  const { data: subscription } = useCurrentSubscription();
  const { data: usage } = useBillingUsage();
  const initializePayment = useInitializeBillingPayment();
  const plans = apiPlans?.length ? apiPlans : fallbackPlans;
  const currentPlanKey = subscription?.plan?.key ?? 'free';

  const startPayment = (planKey: 'plus' | 'pro') => {
    initializePayment.mutate(planKey, {
      onError: (error) => {
        toast.error(getApiErrorMessage(error, 'Could not start payment. Please try again.'));
      },
    });
  };

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', BOTTOM_NAV_HEIGHT, 'md:pb-0')}>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            Billing
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your subscription and AI generation credits.
          </p>
        </div>

        {subscription && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current plan</p>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subscription.plan.name} · {subscription.status}
                </h2>
                {subscription.current_period_end && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              {usage && (
                <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {usage.ai_generation_used}/{usage.ai_generation_limit} AI credits used
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlanKey === plan.key;
            const paidPlanKey = isPaidPlanKey(plan.key) ? plan.key : null;
            return (
              <section
                key={plan.key}
                className={cn(
                  'rounded-xl border bg-white p-5 dark:bg-gray-900',
                  plan.key === 'plus'
                    ? 'border-emerald-300 shadow-sm dark:border-emerald-800'
                    : 'border-gray-200 dark:border-gray-800',
                )}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
                    {plan.key === 'plus' && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Best value
                      </span>
                    )}
                  </div>
                  <p className="mt-1 min-h-[40px] text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                  <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNaira(plan.price_naira)}
                    <span className="text-sm font-medium text-gray-500">/month</span>
                  </p>
                </div>

                <ul className="mb-5 space-y-2">
                  {planFeatures(plan).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button disabled className="w-full rounded-lg">
                    Current plan
                  </Button>
                ) : paidPlanKey ? (
                  <Button
                    onClick={() => startPayment(paidPlanKey)}
                    disabled={initializePayment.isPending || isLoading}
                    className="w-full gap-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {initializePayment.isPending && initializePayment.variables === paidPlanKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Subscribe
                  </Button>
                ) : (
                  <Button disabled variant="outline" className="w-full rounded-lg">
                    Included
                  </Button>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Billing;
