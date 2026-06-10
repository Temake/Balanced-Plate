import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { useGenerateCookingGuide } from '@/hooks/useCookingGuide';
import { recipes } from '@/data/recipes';
import type { CookingGuide, CookingIngredient, CookingStep } from '@/api/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Lightbulb,
  Heart,
  ChefHat,
  ListChecks,
  ChevronDown,
  Loader2,
  AlertTriangle,
  LayoutList,
  Footprints,
} from 'lucide-react';

// ─── Loading Animation ───────────────────────────────────────────────────────

const GeneratingAnimation: React.FC<{ dishName: string }> = ({ dishName }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-500">
    <div className="relative mb-8">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/30 flex items-center justify-center">
        <ChefHat className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 animate-bounce">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-md animate-pulse">
        <Sparkles className="w-3 h-3 text-white" />
      </div>
    </div>

    <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />

    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      Generating your guide…
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
      Our AI chef is preparing step-by-step instructions for{' '}
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dishName}</span>.
    </p>
  </div>
);

// ─── Error State ─────────────────────────────────────────────────────────────

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
    <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
      <AlertTriangle className="w-9 h-9 text-red-500 dark:text-red-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
      Something went wrong
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{message}</p>
    <Button
      onClick={onRetry}
      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl px-6 h-10 text-sm font-semibold gap-2"
    >
      <Sparkles className="w-4 h-4" />
      Try Again
    </Button>
  </div>
);

// ─── Ingredient Item ─────────────────────────────────────────────────────────

interface IngredientItemProps {
  ingredient: CookingIngredient;
  checked: boolean;
  onToggle: () => void;
}

const IngredientItem: React.FC<IngredientItemProps> = ({
  ingredient,
  checked,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className={cn(
      'flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200',
      checked
        ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
    )}
  >
    {/* Checkbox */}
    <div
      className={cn(
        'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
        checked
          ? 'bg-emerald-500 border-emerald-500'
          : 'border-gray-300 dark:border-gray-600',
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" />}
    </div>

    {/* Details */}
    <div className="flex-1 min-w-0">
      <span
        className={cn(
          'text-sm font-medium transition-all',
          checked
            ? 'text-gray-400 dark:text-gray-500 line-through'
            : 'text-gray-900 dark:text-white',
        )}
      >
        {ingredient.name}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
        {ingredient.quantity}
      </span>
    </div>

    {/* Essential dot */}
    {ingredient.is_essential && (
      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" title="Essential" />
    )}
  </button>
);

// ─── Step Card ───────────────────────────────────────────────────────────────

interface StepCardProps {
  step: CookingStep;
  isActive?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, isActive = false }) => (
  <div
    className={cn(
      'rounded-xl border p-4 sm:p-5 transition-all duration-300',
      isActive
        ? 'border-emerald-300 dark:border-emerald-600/50 bg-white dark:bg-gray-800/80 shadow-md shadow-emerald-500/5'
        : 'border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60',
    )}
  >
    {/* Step header */}
    <div className="flex items-start gap-3 mb-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
        <span className="text-xs font-bold text-white">{step.step_number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-relaxed">
          {step.instruction}
        </p>
      </div>
    </div>

    {/* Duration badge */}
    {step.duration_minutes != null && (
      <div className="ml-11 mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30">
          <Clock className="w-3 h-3" />
          {step.duration_minutes} min
        </span>
      </div>
    )}

    {/* Tip */}
    {step.tip && (
      <div className="ml-11 mt-2 flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 px-3 py-2.5">
        <Lightbulb className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          {step.tip}
        </p>
      </div>
    )}
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const CookingAssistant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Find recipe from static data
  const recipe = useMemo(() => recipes.find((r) => r.id === id), [id]);

  // AI mutation
  const { mutate, data: guide, isPending, isError, error, reset } = useGenerateCookingGuide();

  // Local state
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [viewAll, setViewAll] = useState(false);
  const [ingredientsOpen, setIngredientsOpen] = useState(true);

  // Auto-generate when page loads
  useEffect(() => {
    if (recipe) {
      mutate(recipe.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?.id]);

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalSteps = guide?.steps?.length ?? 0;

  const goBack = () => navigate('/recipes');
  const goPrev = () => setCurrentStep((s) => Math.max(0, s - 1));
  const goNext = () => setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));

  // Unknown recipe
  if (!recipe) {
    return (
      <div className={cn('min-h-screen bg-background flex flex-col', BOTTOM_NAV_HEIGHT, 'md:pb-0')}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ChefHat className="w-9 h-9 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Recipe not found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
            We couldn't find the recipe you're looking for.
          </p>
          <Button variant="ghost" onClick={goBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', BOTTOM_NAV_HEIGHT, 'md:pb-0')}>
      {/* ─── Sticky Top Bar ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 -ml-2 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Recipes</span>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {recipe.emoji} {recipe.name}
            </h1>
          </div>

          {isPending && (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium hidden sm:inline">Generating…</span>
            </div>
          )}
        </div>
      </header>

      {/* ─── Content ─── */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-4 sm:py-6">
        {/* Loading */}
        {isPending && <GeneratingAnimation dishName={recipe.name} />}

        {/* Error */}
        {isError && !isPending && (
          <ErrorState
            message={error?.message || 'Failed to generate cooking guide. Please try again.'}
            onRetry={() => {
              reset();
              mutate(recipe.name);
            }}
          />
        )}

        {/* Guide */}
        {guide && !isPending && (
          <CookingGuideView
            guide={guide}
            checkedIngredients={checkedIngredients}
            onToggleIngredient={toggleIngredient}
            ingredientsOpen={ingredientsOpen}
            onToggleIngredients={() => setIngredientsOpen((v) => !v)}
            currentStep={currentStep}
            viewAll={viewAll}
            onToggleViewAll={() => setViewAll((v) => !v)}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </main>

      {/* ─── Sticky Step Navigation (Mobile) ─── */}
      {guide && !isPending && !viewAll && totalSteps > 0 && (
        <div className="sticky bottom-0 z-30 md:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg px-4 py-3 mb-16">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={goPrev}
              disabled={currentStep === 0}
              className="gap-1.5 text-gray-600 dark:text-gray-400"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {currentStep + 1} / {totalSteps}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              disabled={currentStep === totalSteps - 1}
              className="gap-1.5 text-gray-600 dark:text-gray-400"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Guide View ──────────────────────────────────────────────────────────────

interface CookingGuideViewProps {
  guide: CookingGuide;
  checkedIngredients: Set<string>;
  onToggleIngredient: (name: string) => void;
  ingredientsOpen: boolean;
  onToggleIngredients: () => void;
  currentStep: number;
  viewAll: boolean;
  onToggleViewAll: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const CookingGuideView: React.FC<CookingGuideViewProps> = ({
  guide,
  checkedIngredients,
  onToggleIngredient,
  ingredientsOpen,
  onToggleIngredients,
  currentStep,
  viewAll,
  onToggleViewAll,
  onPrev,
  onNext,
}) => {
  const totalSteps = guide.steps?.length ?? 0;
  const progressPercent = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* ─── Meta cards ─── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Servings', value: String(guide.servings), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Prep Time', value: `${guide.total_prep_time_minutes} min`, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Difficulty', value: guide.difficulty, color: 'text-amber-600 dark:text-amber-400' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 p-3 text-center"
          >
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5">
              {m.label}
            </p>
            <p className={cn('text-sm sm:text-base font-bold', m.color)}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Ingredients ─── */}
      <section className="rounded-xl border border-gray-200/80 dark:border-gray-700/50 bg-white dark:bg-gray-800/60 overflow-hidden">
        <button
          onClick={onToggleIngredients}
          className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Ingredients
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({checkedIngredients.size}/{guide.ingredients?.length ?? 0})
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform duration-200',
              ingredientsOpen && 'rotate-180',
            )}
          />
        </button>

        {ingredientsOpen && (
          <div className="px-2 pb-2 space-y-0.5 border-t border-gray-100 dark:border-gray-700/30 pt-1">
            {guide.ingredients?.map((ing) => (
              <IngredientItem
                key={ing.name}
                ingredient={ing}
                checked={checkedIngredients.has(ing.name)}
                onToggle={() => onToggleIngredient(ing.name)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Steps ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Steps</h2>
          </div>
          <button
            onClick={onToggleViewAll}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            {viewAll ? (
              <>
                <Footprints className="w-3.5 h-3.5" />
                Step by Step
              </>
            ) : (
              <>
                <LayoutList className="w-3.5 h-3.5" />
                View All Steps
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {!viewAll && totalSteps > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Step content */}
        {viewAll ? (
          <div className="space-y-3">
            {guide.steps?.map((step) => (
              <StepCard key={step.step_number} step={step} />
            ))}
          </div>
        ) : (
          <>
            {guide.steps?.[currentStep] && (
              <StepCard step={guide.steps[currentStep]} isActive />
            )}

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                disabled={currentStep === 0}
                className="gap-1.5 text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {currentStep + 1} / {totalSteps}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                disabled={currentStep === totalSteps - 1}
                className="gap-1.5 text-gray-600 dark:text-gray-400"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </section>

      {/* ─── Health Notes ─── */}
      {guide.health_notes && (
        <section className="rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                Health Notes
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
                {guide.health_notes}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CookingAssistant;
