import React, { useState, useMemo } from 'react';
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useMealPlans, useGenerateMealPlan, useDeleteMealPlan } from '@/hooks/useMealPlan';
import type { MealPlan, MealEntry } from '@/api/types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Clock,
  Trash2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

const MEAL_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Breakfast: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  Lunch:     { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Dinner:    { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
  Snack:     { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
};

type BudgetLevel = 'low' | 'medium' | 'flexible';

const BUDGET_OPTIONS: { value: BudgetLevel; label: string; emoji: string }[] = [
  { value: 'low', label: 'Low', emoji: '💰' },
  { value: 'medium', label: 'Medium', emoji: '💰💰' },
  { value: 'flexible', label: 'Flexible', emoji: '💰💰💰' },
];

/** Snap any date to the Monday of its ISO week. */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDayDisplay(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── Skeleton Components ─────────────────────────────────────────────────────

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 p-3.5 space-y-2.5">
    <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700/60" />
  </div>
);

const SkeletonDay: React.FC = () => (
  <div className="space-y-2">
    <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
    {MEAL_TYPES.map((t) => (
      <SkeletonCard key={t} />
    ))}
  </div>
);

// ─── Meal Card ───────────────────────────────────────────────────────────────

interface MealCardProps {
  entry: MealEntry;
}

const MealCard: React.FC<MealCardProps> = ({ entry }) => {
  const colors = MEAL_COLORS[entry.meal_type] ?? MEAL_COLORS.Snack;

  return (
    <div className="group relative rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 p-3.5 transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/5 hover:border-emerald-300/50 dark:hover:border-emerald-600/30">
      {/* Meal type badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5', colors.bg, colors.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
          {entry.meal_type}
        </span>
        {entry.is_ai_generated && (
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 opacity-80" />
        )}
      </div>

      {/* Food name */}
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5 line-clamp-2">
        {entry.food_name}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {entry.prep_time_minutes != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {entry.prep_time_minutes}min
          </span>
        )}
      </div>

      {/* Health notes */}
      {entry.health_notes && (
        <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
          {entry.health_notes}
        </p>
      )}
    </div>
  );
};

// ─── Empty Slot ──────────────────────────────────────────────────────────────

interface EmptySlotProps {
  mealType: string;
}

const EmptySlot: React.FC<EmptySlotProps> = ({ mealType }) => {
  const colors = MEAL_COLORS[mealType] ?? MEAL_COLORS.Snack;

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/60 p-3.5 flex flex-col items-center justify-center gap-1.5 min-h-[80px] transition-colors hover:border-emerald-400/60 dark:hover:border-emerald-600/40 cursor-default">
      <span className={cn('text-[10px] font-semibold uppercase tracking-wider', colors.text)}>
        {mealType}
      </span>
      <Plus className="w-4 h-4 text-gray-300 dark:text-gray-600" />
    </div>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGenerate, isGenerating }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {/* Decorative illustration area */}
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/30 flex items-center justify-center">
        <CalendarDays className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
    </div>

    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
      No meal plan for this week
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
      Let AI create a personalised, budget-friendly meal plan tailored to your dietary goals.
    </p>

    <Button
      onClick={onGenerate}
      disabled={isGenerating}
      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25 rounded-xl px-6 h-11 text-sm font-semibold gap-2"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generate with AI
        </>
      )}
    </Button>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const MealPlanner: React.FC = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [budget, setBudget] = useState<BudgetLevel>('medium');
  const [mobileDay, setMobileDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1; // 0=Mon ... 6=Sun
  });

  const { data: mealPlans, isLoading } = useMealPlans();
  const generateMutation = useGenerateMealPlan();
  const deleteMutation = useDeleteMealPlan();

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  // Find the plan matching selected week
  const currentPlan: MealPlan | undefined = useMemo(() => {
    if (!mealPlans) return undefined;
    const ws = formatDate(weekStart);
    return mealPlans.find((p) => p.week_start_date === ws);
  }, [mealPlans, weekStart]);

  // Group entries by day
  const entriesByDay: Record<string, MealEntry[]> = useMemo(() => {
    const map: Record<string, MealEntry[]> = {};
    DAYS.forEach((d) => (map[d] = []));
    currentPlan?.entries?.forEach((e) => {
      if (map[e.day]) map[e.day].push(e);
    });
    return map;
  }, [currentPlan]);

  // Navigation
  const goToPreviousWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const goToNextWeek = () => setWeekStart((prev) => addDays(prev, 7));

  // Generate
  const handleGenerate = () => {
    generateMutation.mutate(
      { week_start_date: formatDate(weekStart), budget_level: budget },
      {
        onSuccess: () => toast.success('Meal plan generated! 🎉'),
        onError: () => toast.error('Failed to generate meal plan. Please try again.'),
      },
    );
  };

  // Delete
  const handleDelete = () => {
    if (!currentPlan) return;
    deleteMutation.mutate(currentPlan.id, {
      onSuccess: () => toast.success('Meal plan deleted.'),
      onError: () => toast.error('Could not delete meal plan.'),
    });
  };

  const isGenerating = generateMutation.isPending;

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', BOTTOM_NAV_HEIGHT, 'md:pb-0')}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Meal Plan
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Plan your weekly meals with AI-powered suggestions.
            </p>
          </div>

          {/* Delete current plan */}
          {currentPlan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete Plan
            </Button>
          )}
        </div>

        {/* ─── Week Selector ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 p-1">
            <button
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[150px] text-center">
              {formatDisplay(weekStart)} – {formatDisplay(weekEnd)}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Budget pills */}
          <div className="flex items-center gap-1.5">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBudget(opt.value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border',
                  budget === opt.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-600',
                )}
              >
                {opt.label} {opt.emoji}
              </button>
            ))}
          </div>

          {/* AI Suggest button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="ml-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl px-5 h-10 text-sm font-semibold gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Suggest Week
              </>
            )}
          </Button>
        </div>

        {/* ─── Generating overlay ─── */}
        {isGenerating && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <div className="relative">
              <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-500 animate-pulse" />
            </div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Our AI is crafting your personalised meal plan…
            </p>
          </div>
        )}

        {/* ─── Content ─── */}
        {isLoading ? (
          /* Loading skeleton */
          <>
            {/* Desktop skeleton */}
            <div className="hidden md:grid grid-cols-7 gap-3">
              {DAYS.map((d) => (
                <SkeletonDay key={d} />
              ))}
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3">
              {MEAL_TYPES.map((t) => (
                <SkeletonCard key={t} />
              ))}
            </div>
          </>
        ) : !currentPlan ? (
          /* Empty state */
          <EmptyState onGenerate={handleGenerate} isGenerating={isGenerating} />
        ) : (
          <>
            {/* ─── Desktop: 7-column grid ─── */}
            <div className="hidden md:grid grid-cols-7 gap-3">
              {DAYS.map((day, idx) => {
                const dayDate = addDays(weekStart, idx);
                const dayEntries = entriesByDay[day] ?? [];

                return (
                  <div key={day} className="space-y-2">
                    {/* Day header */}
                    <div className="sticky top-14 z-10 bg-background/90 backdrop-blur-sm py-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {SHORT_DAYS[idx]}
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        {formatDayDisplay(dayDate)}
                      </p>
                    </div>

                    {/* Meal slots */}
                    {MEAL_TYPES.map((mealType) => {
                      const entry = dayEntries.find(
                        (e) => e.meal_type.toLowerCase() === mealType.toLowerCase(),
                      );
                      return entry ? (
                        <MealCard key={mealType} entry={entry} />
                      ) : (
                        <EmptySlot key={mealType} mealType={mealType} />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* ─── Mobile: day tabs + vertical list ─── */}
            <div className="md:hidden">
              {/* Day tabs */}
              <div className="flex gap-1 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-1 px-1">
                {SHORT_DAYS.map((short, idx) => {
                  const active = mobileDay === idx;
                  const dayDate = addDays(weekStart, idx);
                  return (
                    <button
                      key={short}
                      onClick={() => setMobileDay(idx)}
                      className={cn(
                        'flex flex-col items-center flex-shrink-0 rounded-xl px-3.5 py-2 transition-all duration-200 border min-w-[56px]',
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                          : 'bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700/50',
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide">{short}</span>
                      <span className={cn('text-lg font-bold leading-none mt-0.5', active ? 'text-white' : 'text-gray-900 dark:text-white')}>
                        {dayDate.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Meals for selected day */}
              <div className="space-y-3">
                {MEAL_TYPES.map((mealType) => {
                  const dayName = DAYS[mobileDay];
                  const dayEntries = entriesByDay[dayName] ?? [];
                  const entry = dayEntries.find(
                    (e) => e.meal_type.toLowerCase() === mealType.toLowerCase(),
                  );
                  return entry ? (
                    <MealCard key={mealType} entry={entry} />
                  ) : (
                    <EmptySlot key={mealType} mealType={mealType} />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MealPlanner;
