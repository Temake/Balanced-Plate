import React, { useCallback, useState } from 'react';
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useHealthReport, buildTextSummary } from '@/hooks/useHealthReport';
import type { DayScore, HealthFlag, TopFood, MealTypeCount } from '@/hooks/useHealthReport';
import type { FoodGroupGramsResponse, WeeklyRecommendation } from '@/api/types';
import {
  HeartPulse,
  Printer,
  Copy,
  Utensils,
  CalendarCheck,
  TrendingUp,
  Flame,
  AlertTriangle,
  Target,
  Trophy,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import PaywallPrompt from '@/components/billing/PaywallPrompt';

// ═══════════════════════════════════════════════
//  SKELETON / LOADING STATES
// ═══════════════════════════════════════════════

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />
);

const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-5 space-y-3">
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-3 w-32" />
  </div>
);

const SectionSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-6 space-y-4">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

// ═══════════════════════════════════════════════
//  SUMMARY CARDS
// ═══════════════════════════════════════════════

const summaryCardConfig = [
  {
    key: 'meals',
    label: 'Meals Logged',
    icon: Utensils,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accent: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    key: 'days',
    label: 'Days Tracked',
    icon: CalendarCheck,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accent: 'text-blue-700 dark:text-blue-300',
  },
  {
    key: 'balance',
    label: 'Avg Balance',
    icon: TrendingUp,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'text-amber-700 dark:text-amber-300',
  },
  {
    key: 'streak',
    label: 'Consistency',
    icon: Flame,
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    iconBg: 'bg-violet-100 dark:bg-violet-900/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
    accent: 'text-violet-700 dark:text-violet-300',
  },
] as const;

interface SummaryCardsProps {
  meals: number;
  days: number;
  balance: number;
  streak: number;
  isLoading: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ meals, days, balance, streak, isLoading }) => {
  const values: Record<string, React.ReactNode> = {
    meals: meals,
    days: (
      <span>
        {days}
        <span className="text-base font-normal text-gray-400 dark:text-gray-500">/7</span>
      </span>
    ),
    balance: `${balance}%`,
    streak: (
      <span>
        {streak}
        <span className="text-base font-normal text-gray-400 dark:text-gray-500"> days</span>
      </span>
    ),
  };

  const subtexts: Record<string, string> = {
    meals: 'this week',
    days: `${Math.round((days / 7) * 100)}% of the week`,
    balance: balance >= 70 ? 'On track' : balance >= 50 ? 'Room to improve' : 'Needs attention',
    streak: streak >= 5 ? 'Strong consistency' : streak >= 3 ? 'Building consistency' : 'More data needed',
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {summaryCardConfig.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className={`
              group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800
              ${card.bg} p-4 sm:p-5
              transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20
              hover:-translate-y-0.5 animate-fade-in-up
            `}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Decorative circle */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 bg-current" />

            <div className={`inline-flex p-2.5 rounded-xl ${card.iconBg} mb-3`}>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className={`text-2xl sm:text-3xl font-bold ${card.accent}`}>
              {values[card.key]}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtexts[card.key]}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  MOST COMMON FOODS
// ═══════════════════════════════════════════════

const MostCommonFoods: React.FC<{ foods: TopFood[]; maxCount: number }> = ({ foods, maxCount }) => {
  if (foods.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No food data yet. Start scanning meals to see your favourites!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {foods.map((food, i) => {
        const pct = maxCount > 0 ? (food.count / maxCount) * 100 : 0;
        return (
          <div
            key={food.name}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                {food.name}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                ×{food.count}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  MEAL TYPES
// ═══════════════════════════════════════════════

const MealTypes: React.FC<{ types: MealTypeCount[] }> = ({ types }) => {
  if (types.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No meal type data available yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {types.map(m => (
        <span
          key={m.type}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-transform hover:scale-105"
          style={{
            backgroundColor: `${m.color}15`,
            borderColor: `${m.color}30`,
            color: m.color,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: m.color }}
          />
          {m.type}
          <span className="font-bold">{m.count}</span>
        </span>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  NUTRITION OVERVIEW
// ═══════════════════════════════════════════════

const FOOD_GROUP_CONFIG = [
  { key: 'total_carbs_grams' as const, label: 'Carbs', color: '#3b82f6' },
  { key: 'total_protein_grams' as const, label: 'Protein', color: '#10b981' },
  { key: 'total_vegetable_grams' as const, label: 'Vegetables', color: '#22c55e' },
  { key: 'total_fruit_grams' as const, label: 'Fruits', color: '#f59e0b' },
  { key: 'total_dairy_grams' as const, label: 'Dairy', color: '#8b5cf6' },
  { key: 'total_fat_grams' as const, label: 'Fats', color: '#ef4444' },
];

const NutritionOverview: React.FC<{ data: FoodGroupGramsResponse | null }> = ({ data }) => {
  if (!data) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No nutrition data available yet.
      </p>
    );
  }

  const maxVal = Math.max(
    ...FOOD_GROUP_CONFIG.map(g => data[g.key] || 0),
    1,
  );

  return (
    <div className="space-y-3">
      {FOOD_GROUP_CONFIG.map((group, i) => {
        const val = data[group.key] || 0;
        const pct = (val / maxVal) * 100;
        return (
          <div
            key={group.key}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {group.label}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {Math.round(val)}g
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, backgroundColor: group.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  WEEKLY BALANCE TREND
// ═══════════════════════════════════════════════

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-200 dark:bg-gray-800';
  if (score >= 70) return 'bg-emerald-500 dark:bg-emerald-400';
  if (score >= 50) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

function getScoreTextColor(score: number | null): string {
  if (score === null) return 'text-gray-400 dark:text-gray-600';
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

const WeeklyBalanceTrend: React.FC<{ scores: DayScore[] }> = ({ scores }) => {
  const maxScore = 100;

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3 h-48 px-1">
      {scores.map((s, i) => {
        const height = s.score !== null ? Math.max((s.score / maxScore) * 100, 4) : 8;
        return (
          <div
            key={s.shortDay}
            className="flex-1 flex flex-col items-center gap-1.5 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Score label */}
            <span className={`text-xs font-bold ${getScoreTextColor(s.score)}`}>
              {s.score !== null ? `${s.score}%` : '—'}
            </span>
            {/* Bar */}
            <div className="w-full flex justify-center flex-1 items-end">
              <div
                className={`
                  w-full max-w-[40px] rounded-t-lg transition-all duration-700 ease-out
                  ${getScoreColor(s.score)}
                  ${s.score === null ? 'opacity-30' : 'opacity-100'}
                `}
                style={{ height: `${height}%` }}
              />
            </div>
            {/* Day label */}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {s.shortDay}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Legend
const BalanceLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
    {[
      { color: 'bg-emerald-500', label: 'Good (≥70%)' },
      { color: 'bg-amber-500', label: 'Fair (50-69%)' },
      { color: 'bg-red-500', label: 'Needs Work (<50%)' },
      { color: 'bg-gray-300 dark:bg-gray-700', label: 'No data' },
    ].map(item => (
      <div key={item.label} className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════
//  HEALTH RISK INDICATORS
// ═══════════════════════════════════════════════

const HealthRiskCard: React.FC<{ flag: HealthFlag; index: number }> = ({ flag, index }) => {
  const isDanger = flag.severity === 'danger';
  return (
    <div
      className={`
        rounded-2xl border p-4 sm:p-5 animate-fade-in-up
        ${isDanger
          ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
        }
      `}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            flex-shrink-0 p-2 rounded-xl
            ${isDanger
              ? 'bg-red-100 dark:bg-red-900/50'
              : 'bg-amber-100 dark:bg-amber-900/50'
            }
          `}
        >
          <AlertTriangle
            className={`w-5 h-5 ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-bold ${isDanger ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}
            >
              {flag.title}
            </h4>
            {flag.value && (
              <span
                className={`
                  text-xs font-bold px-2 py-0.5 rounded-full
                  ${isDanger
                    ? 'bg-red-200/60 dark:bg-red-800/40 text-red-700 dark:text-red-300'
                    : 'bg-amber-200/60 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300'
                  }
                `}
              >
                {flag.value}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {flag.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
//  RECOMMENDED ACTIONS
// ═══════════════════════════════════════════════

const RecommendedActions: React.FC<{ recommendation: WeeklyRecommendation | null }> = ({
  recommendation,
}) => {
  if (!recommendation) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
        No recommended actions are available yet. Complete a few more meals to build a meaningful weekly pattern.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Priority Actions */}
      {recommendation.priority_actions && recommendation.priority_actions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Priority Actions
            </h4>
          </div>
          <div className="space-y-2">
            {recommendation.priority_actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-amber-400 dark:border-amber-500 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {i + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Goals */}
      {recommendation.weekly_goals && recommendation.weekly_goals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Weekly Goals
            </h4>
          </div>
          <div className="grid gap-2">
            {recommendation.weekly_goals.map((goal, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex-shrink-0 p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {goal}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  SECTION WRAPPER
// ═══════════════════════════════════════════════

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ title, children, className = '', id }) => (
  <section
    id={id}
    className={`
      rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800
      p-5 sm:p-6 animate-fade-in-up ${className}
    `}
  >
    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
    {children}
  </section>
);

// ═══════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════

const HealthReport: React.FC = () => {
  const { data, isLoading, user, isPaymentRequired } = useHealthReport();
  const [copied, setCopied] = useState(false);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopy = useCallback(async () => {
    if (!data) return;
    try {
      const text = buildTextSummary(data, user?.first_name);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Report copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy. Please try again.');
    }
  }, [data, user?.first_name]);

  if (isPaymentRequired) {
    return (
      <div className={`min-h-screen bg-background flex flex-col ${BOTTOM_NAV_HEIGHT} md:pb-0`}>
        <Header />
        <main className="container mx-auto max-w-3xl flex-grow px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                <HeartPulse className="w-6 h-6 text-rose-500 dark:text-rose-400" />
              </div>
              Health Report
            </h1>
          </div>
          <PaywallPrompt
            title="Health reports are a paid feature"
            message="Upgrade to Plus or Pro to view weekly reports, recommended actions, and nutrition trends."
          />
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          /* Hide non-content elements */
          header, nav, .no-print, button { display: none !important; }
          /* Reset background */
          body, .dark { background: white !important; color: black !important; }
          /* Full width */
          .print-content { max-width: 100% !important; padding: 0 !important; }
          /* Clean card styling */
          .print-content section,
          .print-content > div { 
            border: 1px solid #e5e7eb !important; 
            background: white !important;
            color: #111 !important;
            break-inside: avoid;
          }
          .print-content h1, .print-content h2, .print-content h3, .print-content h4 {
            color: #111 !important;
          }
          .print-content p, .print-content span {
            color: #374151 !important;
          }
        }
      `}</style>

      <div className={`min-h-screen bg-background flex flex-col ${BOTTOM_NAV_HEIGHT} md:pb-0`}>
        <div className="no-print">
          <Header />
        </div>

        <main className="print-content container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-5xl">
          {/* ─── Page Header ─── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                  <HeartPulse className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                </div>
                Health Report
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 ml-[3.25rem]">
                Your weekly eating summary
                {user?.first_name && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {' '}
                    — {user.first_name}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={isLoading}
                className="gap-2 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Text'}</span>
              </Button>
            </div>
          </div>

          {/* ─── Loading State ─── */}
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(4)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionSkeleton />
                <SectionSkeleton />
              </div>
              <SectionSkeleton />
              <SectionSkeleton />
            </div>
          ) : (
            <div className="space-y-6">
              {/* ─── Summary Cards ─── */}
              <SummaryCards
                meals={data.totalMealsLogged}
                days={data.daysTracked}
                balance={data.averageBalanceScore}
                streak={data.consistencyStreak}
                isLoading={false}
              />

              {/* ─── Eating Patterns Row ─── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Section title="Most Common Foods" id="common-foods">
                  <MostCommonFoods
                    foods={data.mostCommonFoods}
                    maxCount={data.mostCommonFoods[0]?.count ?? 1}
                  />
                </Section>
                <Section title="Meal Types" id="meal-types">
                  <MealTypes types={data.mealTypeCounts} />
                </Section>
              </div>

              {/* ─── Nutrition Overview ─── */}
              <Section title="Nutrition Overview" id="nutrition-overview">
                <NutritionOverview data={data.foodGroups} />
              </Section>

              {/* ─── Weekly Balance Trend ─── */}
              <Section title="Weekly Balance Trend" id="balance-trend">
                <WeeklyBalanceTrend scores={data.weeklyScores} />
                <BalanceLegend />
              </Section>

              {/* ─── Health Risk Indicators (conditional) ─── */}
              {data.healthFlags.length > 0 && (
                <div id="health-alerts">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Health Risk Indicators
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.healthFlags.map((flag, i) => (
                      <HealthRiskCard key={flag.id} flag={flag} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Recommended Actions ─── */}
              <Section title="Recommended Actions" id="recommended-actions">
                <RecommendedActions recommendation={data.latestRecommendation} />
              </Section>
            </div>
          )}

          {/* ─── Loading overlay for long fetches ─── */}
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm no-print">
              <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Generating your health report…
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default HealthReport;
