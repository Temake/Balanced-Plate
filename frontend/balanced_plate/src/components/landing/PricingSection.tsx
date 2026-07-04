import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  gradient: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'For basic tracking and unlimited photo analysis',
    price: 0,
    icon: Sparkles,
    gradient: 'from-gray-500 to-gray-600',
    features: [
      'Unlimited photo food analysis',
      'Basic nutrition breakdown',
      'Manual meal planning',
      'Analysis history',
      'Basic dashboard access',
    ],
  },
  {
    name: 'Plus',
    description: 'For regular planning and progress tracking',
    price: 2400,
    icon: Zap,
    gradient: 'from-green-500 to-emerald-600',
    highlighted: true,
    badge: 'Best Value',
    features: [
      'Everything in Free',
      'Detailed analytics',
      'Weekly health reports',
      'AI meal planning',
      'AI cooking guide',
      '30 AI credits/month',
    ],
  },
  {
    name: 'Pro',
    description: 'For heavier AI planning and cooking support',
    price: 4500,
    icon: Crown,
    gradient: 'from-slate-600 to-gray-800',
    features: [
      'Everything in Plus',
      '100 AI credits/month',
      'Higher AI usage allowance',
      'Best for frequent planning',
      'Reports and analytics access',
      'Cancel anytime',
    ],
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Nigeria Monthly Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Start free. Upgrade when you need analytics, reports, AI meal planning, and AI cooking help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-105 lg:scale-110 z-10'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold">
                    {plan.badge}
                  </div>
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                plan.highlighted ? 'bg-white/20' : `bg-gradient-to-br ${plan.gradient}`
              }`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description}
              </p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className={plan.highlighted ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}>
                      /month
                    </span>
                  )}
                </div>
              </div>

              <Link to={plan.price === 0 ? '/signup' : '/billing'} className="block mb-8">
                <Button
                  className={`w-full h-12 text-base font-semibold ${
                    plan.highlighted
                      ? 'bg-white text-green-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Subscribe'}
                </Button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'bg-white/20' : 'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-green-600 dark:text-green-400'}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Secure payment by Paystack · Monthly billing · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
