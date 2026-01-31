import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';

interface PricingPlan {
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  icon: React.ElementType;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  gradient: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    icon: Sparkles,
    gradient: 'from-gray-500 to-gray-600',
    features: [
      '10 meal analyses per month',
      'Basic nutrition breakdown',
      'Daily calorie tracking',
      'Mobile app access',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    description: 'For serious nutrition tracking',
    price: { monthly: 9.99, yearly: 7.99 },
    icon: Zap,
    gradient: 'from-green-500 to-emerald-600',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Unlimited meal analyses',
      'Detailed macro & micro nutrients',
      'Personalized recommendations',
      'Progress analytics & insights',
      'Meal planning suggestions',
      'Export reports (PDF/CSV)',
      'Priority email support',
    ],
  },
  {
    name: 'Premium',
    description: 'For professionals & teams',
    price: { monthly: 19.99, yearly: 15.99 },
    icon: Crown,
    gradient: 'from-purple-500 to-indigo-600',
    features: [
      'Everything in Pro',
      'API access',
      'Custom nutrition goals',
      'Family/team accounts (up to 5)',
      'Advanced AI insights',
      'Dedicated account manager',
      '24/7 priority support',
      'Early access to new features',
    ],
  },
];

const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Start free and upgrade as you grow. All plans include a 14-day money-back guarantee.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isYearly ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="px-2 py-1 text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full">
              Save 20%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/25 scale-105 lg:scale-110 z-10'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold shadow-lg">
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                plan.highlighted
                  ? 'bg-white/20'
                  : `bg-gradient-to-br ${plan.gradient}`
              }`}>
                <plan.icon className={`w-7 h-7 ${plan.highlighted ? 'text-white' : 'text-white'}`} />
              </div>

              {/* Plan Info */}
              <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className={plan.highlighted ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}>
                      /month
                    </span>
                  )}
                </div>
                {isYearly && plan.price.monthly > 0 && (
                  <p className={`text-sm mt-1 ${plan.highlighted ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                    Billed annually (${(plan.price.yearly * 12).toFixed(2)}/year)
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <Link to="/signup" className="block mb-8">
                <Button
                  className={`w-full h-12 text-base font-semibold ${
                    plan.highlighted
                      ? 'bg-white text-green-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  {plan.price.monthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Button>
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-3">
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

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            🔒 Secure payment · 14-day money-back guarantee · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
