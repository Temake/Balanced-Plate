import React, { useMemo, useState } from 'react';
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  useMealPlans,
  useGenerateMealPlan,
  useGenerateDayMealPlan,
  useUpsertMealEntry,
  useDeleteMealEntry,
  useDeleteMealPlan,
} from '@/hooks/useMealPlan';
import type { MealEntry, UpsertMealEntryRequest } from '@/api/types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Clock,
  Trash2,
  Loader2,
  Wallet,
  Banknote,
  Landmark,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PaywallPrompt from '@/components/billing/PaywallPrompt';
import { getApiErrorMessage, isPaymentRequiredError } from '@/utils/billing';

const DAYS = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
] as const;

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
] as const;

const MEAL_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  breakfast: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  lunch: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  dinner: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-500' },
  snack: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
};

type BudgetLevel = 'low' | 'medium' | 'flexible';

const BUDGET_OPTIONS: { value: BudgetLevel; label: string; icon: React.ElementType }[] = [
  { value: 'low', label: 'Low', icon: Wallet },
  { value: 'medium', label: 'Medium', icon: Banknote },
  { value: 'flexible', label: 'Flexible', icon: Landmark },
];

type EditingSlot = {
  day: string;
  mealType: string;
  entry?: MealEntry;
};

type MealEntryFormState = {
  food_name: string;
  description: string;
  prep_time_minutes: string;
  health_notes: string;
};

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function normalize(value?: string | null) {
  return (value ?? '').toLowerCase();
}

const emptyForm = (): MealEntryFormState => ({
  food_name: '',
  description: '',
  prep_time_minutes: '',
  health_notes: '',
});

const formFromEntry = (entry?: MealEntry): MealEntryFormState => ({
  food_name: entry?.food_name ?? '',
  description: entry?.description ?? '',
  prep_time_minutes: entry?.prep_time_minutes != null ? String(entry.prep_time_minutes) : '',
  health_notes: entry?.health_notes ?? '',
});

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
      <SkeletonCard key={t.value} />
    ))}
  </div>
);

const MealEditor: React.FC<{
  form: MealEntryFormState;
  mealLabel: string;
  isSaving: boolean;
  onChange: (form: MealEntryFormState) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ form, mealLabel, isSaving, onChange, onSave, onCancel }) => (
  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
        {mealLabel}
      </p>
      <button
        onClick={onCancel}
        className="rounded-lg p-1 text-gray-500 hover:bg-white dark:hover:bg-gray-800"
        aria-label="Cancel editing"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    <input
      value={form.food_name}
      onChange={(event) => onChange({ ...form, food_name: event.target.value })}
      placeholder="Food name, e.g. Moi Moi with pap"
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
    <textarea
      value={form.description}
      onChange={(event) => onChange({ ...form, description: event.target.value })}
      placeholder="Short note or ingredients"
      rows={2}
      className="w-full resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
    <div className="grid grid-cols-[90px_1fr] gap-2">
      <input
        value={form.prep_time_minutes}
        onChange={(event) => onChange({ ...form, prep_time_minutes: event.target.value.replace(/[^0-9]/g, '') })}
        placeholder="Mins"
        inputMode="numeric"
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <input
        value={form.health_notes}
        onChange={(event) => onChange({ ...form, health_notes: event.target.value })}
        placeholder="Health note"
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
    <Button
      onClick={onSave}
      disabled={isSaving || form.food_name.trim().length === 0}
      className="h-9 w-full gap-2 rounded-lg bg-emerald-600 text-sm text-white hover:bg-emerald-700"
    >
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Save meal
    </Button>
  </div>
);

const MealCard: React.FC<{
  entry: MealEntry;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}> = ({ entry, onEdit, onDelete, isDeleting }) => {
  const mealType = normalize(entry.meal_type);
  const colors = MEAL_COLORS[mealType] ?? MEAL_COLORS.snack;

  return (
    <div className="group relative rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 p-3.5 transition-all duration-200 hover:shadow-md hover:shadow-emerald-500/5 hover:border-emerald-300/50 dark:hover:border-emerald-600/30">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5', colors.bg, colors.text)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
          {MEAL_TYPES.find((m) => m.value === mealType)?.label ?? entry.meal_type}
        </span>
        <div className="flex items-center gap-1">
          {entry.is_ai_generated && (
            <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 opacity-80" />
          )}
          <button
            onClick={onEdit}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-700"
            aria-label="Edit meal"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
            aria-label="Delete meal"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <p className="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
        {entry.food_name}
      </p>
      {entry.description && (
        <p className="mb-2 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          {entry.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {entry.prep_time_minutes != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {entry.prep_time_minutes}min
          </span>
        )}
      </div>
      {entry.health_notes && (
        <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
          {entry.health_notes}
        </p>
      )}
    </div>
  );
};

const EmptySlot: React.FC<{
  mealType: string;
  mealLabel: string;
  onAdd: () => void;
}> = ({ mealType, mealLabel, onAdd }) => {
  const colors = MEAL_COLORS[mealType] ?? MEAL_COLORS.snack;

  return (
    <button
      onClick={onAdd}
      className="min-h-[86px] w-full rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/60 p-3.5 flex flex-col items-center justify-center gap-1.5 transition-colors hover:border-emerald-400/60 hover:bg-emerald-50/40 dark:hover:border-emerald-600/40 dark:hover:bg-emerald-950/10"
    >
      <span className={cn('text-[10px] font-semibold uppercase tracking-wider', colors.text)}>
        {mealLabel}
      </span>
      <Plus className="h-4 w-4 text-gray-300 dark:text-gray-600" />
      <span className="text-[11px] text-gray-400 dark:text-gray-500">Add manually</span>
    </button>
  );
};

const MealPlanner: React.FC = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [budget, setBudget] = useState<BudgetLevel>('medium');
  const [mobileDay, setMobileDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [form, setForm] = useState<MealEntryFormState>(() => emptyForm());
  const [aiPaywallMessage, setAiPaywallMessage] = useState<string | null>(null);

  const { data: mealPlans, isLoading } = useMealPlans();
  const generateWeekMutation = useGenerateMealPlan();
  const generateDayMutation = useGenerateDayMealPlan();
  const upsertEntryMutation = useUpsertMealEntry();
  const deleteEntryMutation = useDeleteMealEntry();
  const deletePlanMutation = useDeleteMealPlan();

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const weekStartDate = formatDate(weekStart);

  const currentPlan = useMemo(() => {
    if (!mealPlans) return undefined;
    return mealPlans.find((plan) => plan.week_start_date === weekStartDate);
  }, [mealPlans, weekStartDate]);

  const entriesByDay = useMemo(() => {
    const map: Record<string, MealEntry[]> = {};
    DAYS.forEach((day) => (map[day.value] = []));
    currentPlan?.entries?.forEach((entry) => {
      const day = normalize(entry.day);
      if (map[day]) map[day].push(entry);
    });
    return map;
  }, [currentPlan]);

  const startEditing = (day: string, mealType: string, entry?: MealEntry) => {
    setEditingSlot({ day, mealType, entry });
    setForm(formFromEntry(entry));
  };

  const cancelEditing = () => {
    setEditingSlot(null);
    setForm(emptyForm());
  };

  const saveEntry = () => {
    if (!editingSlot) return;

    const payload: UpsertMealEntryRequest = {
      week_start_date: weekStartDate,
      budget_level: budget,
      day: editingSlot.day,
      meal_type: editingSlot.mealType,
      food_name: form.food_name.trim(),
      description: form.description.trim(),
      prep_time_minutes: form.prep_time_minutes ? Number(form.prep_time_minutes) : null,
      health_notes: form.health_notes.trim(),
    };

    upsertEntryMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Meal saved.');
        cancelEditing();
      },
      onError: () => toast.error('Could not save meal. Please try again.'),
    });
  };

  const generateDay = (day: string) => {
    setAiPaywallMessage(null);
    generateDayMutation.mutate(
      { week_start_date: weekStartDate, budget_level: budget, day },
      {
        onSuccess: () => toast.success(`${DAYS.find((d) => d.value === day)?.label} meals generated.`),
        onError: (error) => {
          if (isPaymentRequiredError(error)) {
            setAiPaywallMessage(getApiErrorMessage(error, 'AI meal planning requires Plus or Pro.'));
            return;
          }
          toast.error('Could not generate meals for that day.');
        },
      },
    );
  };

  const generateWeek = () => {
    setAiPaywallMessage(null);
    generateWeekMutation.mutate(
      { week_start_date: weekStartDate, budget_level: budget },
      {
        onSuccess: () => toast.success('Weekly meal plan generated.'),
        onError: (error) => {
          if (isPaymentRequiredError(error)) {
            setAiPaywallMessage(getApiErrorMessage(error, 'AI meal planning requires Plus or Pro.'));
            return;
          }
          toast.error('Failed to generate weekly meal plan.');
        },
      },
    );
  };

  const deleteEntry = (entry: MealEntry) => {
    deleteEntryMutation.mutate(entry.id, {
      onSuccess: () => toast.success('Meal removed.'),
      onError: () => toast.error('Could not remove meal.'),
    });
  };

  const deletePlan = () => {
    if (!currentPlan) return;
    deletePlanMutation.mutate(currentPlan.id, {
      onSuccess: () => toast.success('Meal plan deleted.'),
      onError: () => toast.error('Could not delete meal plan.'),
    });
  };

  const renderSlot = (day: string, mealType: string, mealLabel: string, entries: MealEntry[]) => {
    const entry = entries.find((item) => normalize(item.meal_type) === mealType);
    const isEditing = editingSlot?.day === day && editingSlot.mealType === mealType;

    if (isEditing) {
      return (
        <MealEditor
          key={mealType}
          form={form}
          mealLabel={mealLabel}
          isSaving={upsertEntryMutation.isPending}
          onChange={setForm}
          onSave={saveEntry}
          onCancel={cancelEditing}
        />
      );
    }

    if (entry) {
      return (
        <MealCard
          key={mealType}
          entry={entry}
          onEdit={() => startEditing(day, mealType, entry)}
          onDelete={() => deleteEntry(entry)}
          isDeleting={deleteEntryMutation.isPending}
        />
      );
    }

    return (
      <EmptySlot
        key={mealType}
        mealType={mealType}
        mealLabel={mealLabel}
        onAdd={() => startEditing(day, mealType)}
      />
    );
  };

  const generatingWeek = generateWeekMutation.isPending;
  const generatingDay = generateDayMutation.isPending;

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', BOTTOM_NAV_HEIGHT, 'md:pb-0')}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Meal Plan
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl">
              Build your week your way: type meals manually, ask AI for one day, or generate a full week and edit any slot.
            </p>
          </div>

          {currentPlan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deletePlan}
              disabled={deletePlanMutation.isPending}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 self-start"
            >
              {deletePlanMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Plan
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 p-1 w-fit">
            <button
              onClick={() => setWeekStart((prev) => addDays(prev, -7))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap min-w-[150px] text-center">
              {formatDisplay(weekStart)} - {formatDisplay(weekEnd)}
            </span>
            <button
              onClick={() => setWeekStart((prev) => addDays(prev, 7))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors text-gray-500 dark:text-gray-400"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {BUDGET_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setBudget(opt.value)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 border flex items-center gap-1',
                    budget === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                      : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-600',
                  )}
                >
                  {opt.label}
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          <Button
            onClick={generateWeek}
            disabled={generatingWeek}
            className="xl:ml-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl px-5 h-10 text-sm font-semibold gap-2 w-full sm:w-fit"
          >
            {generatingWeek ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating week...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Suggest Week
              </>
            )}
          </Button>
        </div>

        {aiPaywallMessage && (
          <div className="mb-6">
            <PaywallPrompt
              title="AI meal planning is a paid feature"
              message={aiPaywallMessage}
            />
          </div>
        )}

        {(generatingWeek || generatingDay) && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              AI is preparing Nigerian meal ideas for your plan...
            </p>
          </div>
        )}

        {isLoading ? (
          <>
            <div className="hidden md:grid grid-cols-7 gap-3">
              {DAYS.map((day) => (
                <SkeletonDay key={day.value} />
              ))}
            </div>
            <div className="md:hidden space-y-3">
              {MEAL_TYPES.map((type) => (
                <SkeletonCard key={type.value} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-7 gap-3">
              {DAYS.map((day, idx) => {
                const dayDate = addDays(weekStart, idx);
                const dayEntries = entriesByDay[day.value] ?? [];
                const dayIsGenerating = generatingDay && generateDayMutation.variables?.day === day.value;

                return (
                  <section key={day.value} className="space-y-2">
                    <div className="sticky top-14 z-10 rounded-xl bg-background/95 py-2 backdrop-blur-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {day.short}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500">
                            {formatDayDisplay(dayDate)}
                          </p>
                        </div>
                        <button
                          onClick={() => generateDay(day.value)}
                          disabled={generatingDay || generatingWeek}
                          className="rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:hover:bg-amber-950/30"
                          title={`Generate AI meals for ${day.label}`}
                        >
                          {dayIsGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {MEAL_TYPES.map((mealType) =>
                      renderSlot(day.value, mealType.value, mealType.label, dayEntries),
                    )}
                  </section>
                );
              })}
            </div>

            <div className="md:hidden">
              <div className="flex gap-1 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-1 px-1">
                {DAYS.map((day, idx) => {
                  const active = mobileDay === idx;
                  const dayDate = addDays(weekStart, idx);
                  return (
                    <button
                      key={day.value}
                      onClick={() => setMobileDay(idx)}
                      className={cn(
                        'flex flex-col items-center flex-shrink-0 rounded-xl px-3.5 py-2 transition-all duration-200 border min-w-[56px]',
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                          : 'bg-white dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700/50',
                      )}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide">{day.short}</span>
                      <span className={cn('text-lg font-bold leading-none mt-0.5', active ? 'text-white' : 'text-gray-900 dark:text-white')}>
                        {dayDate.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 p-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {DAYS[mobileDay].label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDayDisplay(addDays(weekStart, mobileDay))}
                  </p>
                </div>
                <Button
                  onClick={() => generateDay(DAYS[mobileDay].value)}
                  disabled={generatingDay || generatingWeek}
                  size="sm"
                  className="gap-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                >
                  {generatingDay && generateDayMutation.variables?.day === DAYS[mobileDay].value ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI Day
                </Button>
              </div>

              <div className="space-y-3">
                {MEAL_TYPES.map((mealType) =>
                  renderSlot(
                    DAYS[mobileDay].value,
                    mealType.value,
                    mealType.label,
                    entriesByDay[DAYS[mobileDay].value] ?? [],
                  ),
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MealPlanner;
