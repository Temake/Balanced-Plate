import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header, { BOTTOM_NAV_HEIGHT } from "@/components/Header";
import {
  NutritionSummaryCards,
  RecommendationsPanel,
  AnalyticsSection,
  HealthInsights,
  DateRangeFilter,
} from "@/components/dashboard";
import type { DateRange } from "@/components/dashboard";
import { useNutritionAnalytics } from "@/hooks/useNutritionAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary, SectionErrorFallback } from "@/components/common/ErrorBoundary";
import PaywallPrompt from "@/components/billing/PaywallPrompt";
import type { FoodAnalysis } from "@/api/types";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  ChefHat,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileText,
  RefreshCw,
  Sparkles,
  Utensils,
} from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const isToday = (dateString?: string) => {
  if (!dateString) return false;
  const mealDate = new Date(dateString);
  const today = new Date();
  return mealDate.toDateString() === today.toDateString();
};

const getAnalysisName = (analysis: FoodAnalysis) =>
  analysis.food_name ||
  analysis.detected_foods?.[0]?.name ||
  analysis.meal_type ||
  "Logged meal";

const getAnalysisFeedback = (analysis: FoodAnalysis) =>
  analysis.conversational_feedback ||
  analysis.actionable_suggestion ||
  "Nice work logging this meal. Keep building the habit one plate at a time.";

const QuickLinkCard: React.FC<{
  to: string;
  label: string;
  description: string;
  icon: React.ElementType;
}> = ({ to, label, description, icon: Icon }) => (
  <Link
    to={to}
    className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-sm font-semibold text-foreground">{label}</p>
    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
  </Link>
);

const RecentMealCard: React.FC<{ analysis: FoodAnalysis }> = ({ analysis }) => {
  const image = analysis.image_url || analysis.food_image;

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {image ? (
          <img
            src={image}
            alt={getAnalysisName(analysis)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Utensils className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {getAnalysisName(analysis)}
          </p>
          {analysis.meal_type && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {analysis.meal_type}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {getAnalysisFeedback(analysis)}
        </p>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [showDetails, setShowDetails] = useState(false);
  const { data, isLoading, error, isPaymentRequired, refetch } = useNutritionAnalytics(dateRange);

  const recentAnalyses = data?.recentAnalyses ?? [];
  const recentMeals = recentAnalyses.slice(0, 3);
  const mealsToday = useMemo(
    () => recentAnalyses.filter((analysis) => isToday(analysis.date_added)).length,
    [recentAnalyses],
  );
  const daysTracked = data?.weeklyBalance.filter((day) => day.balance > 0).length ?? 0;
  const weeklyProgress = Math.min(Math.round((daysTracked / 7) * 100), 100);
  const encouragement =
    daysTracked >= 5
      ? "You are showing up consistently this week."
      : daysTracked >= 3
        ? "You are building a solid tracking rhythm."
        : "A few more scans will make your weekly picture clearer.";

  return (
    <div className={`min-h-screen bg-background flex flex-col ${BOTTOM_NAV_HEIGHT} md:pb-0`}>
      <Header />

      <main className="container mx-auto max-w-7xl flex-grow px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{getGreeting()}</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              {user?.first_name ? `${user.first_name}, your plate check is here` : "Your plate check is here"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
              title="Refresh dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowDetails((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && !isPaymentRequired && (
          <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error} - showing cached or default data where available.
          </div>
        )}

        <section className="mb-5 grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/12 via-card to-accent/40 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Accountability first, numbers second
                </div>
                <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                  Scan your next meal and get one useful nudge.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  You have scanned {mealsToday} {mealsToday === 1 ? "meal" : "meals"} today.
                  {mealsToday > 0
                    ? " Keep the habit going while the day is still fresh."
                    : " Your first scan today will set the tone for better choices."}
                </p>
              </div>
              <button
                onClick={() => navigate("/analyze-food")}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 md:w-auto"
              >
                <Camera className="h-5 w-5" />
                Scan Your Food
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Weekly streak</p>
                <p className="text-xs text-muted-foreground">{encouragement}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="mb-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">{daysTracked}</span>
              <span className="pb-1 text-sm font-medium text-muted-foreground">/ 7 days tracked</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mb-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Recent meals</h2>
                <p className="text-sm text-muted-foreground">Your last scans, in plain language.</p>
              </div>
              <Link
                to="/history"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-20 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentMeals.length > 0 ? (
              <div className="space-y-3">
                {recentMeals.map((analysis) => (
                  <RecentMealCard key={analysis.id} analysis={analysis} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
                <Utensils className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">No meals scanned yet</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Scan a Nigerian meal and your feedback will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <QuickLinkCard
              to="/meal-plan"
              label="Plan Meals"
              description="Map out a realistic Nigerian week."
              icon={ClipboardList}
            />
            <QuickLinkCard
              to="/health-report"
              label="Health Report"
              description="Preview your weekly food summary."
              icon={FileText}
            />
            <QuickLinkCard
              to="/recipes"
              label="Cook Something"
              description="Step-by-step local cooking help."
              icon={ChefHat}
            />
          </div>
        </section>

        <section className="mb-5">
          {isPaymentRequired ? (
            <PaywallPrompt
              title="Recommendations are a paid feature"
              message="Upgrade to Plus or Pro to view AI recommendations, analytics, and reports."
            />
          ) : (
            <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load recommendations" />}>
              <RecommendationsPanel
                recommendations={data?.recommendations}
                isLoading={isLoading}
                timeFilter={dateRange}
                onTimeFilterChange={setDateRange}
              />
            </ErrorBoundary>
          )}
        </section>

        {showDetails && (
          <section className="space-y-5 rounded-3xl border border-border bg-card/60 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Detailed analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Deeper nutrition charts are here when you need them.
                </p>
              </div>
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            {isPaymentRequired ? (
              <PaywallPrompt
                title="Detailed analytics are a paid feature"
                message="Upgrade to Plus or Pro to unlock food group trends, balance scores, meal timing, and health insights."
              />
            ) : (
              <>
                <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load nutrition summary" />}>
                  <NutritionSummaryCards data={data?.summary} isLoading={isLoading} />
                </ErrorBoundary>

                <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load analytics" onRetry={refetch} />}>
                  <AnalyticsSection
                    foodData={data?.foodGroups}
                    weeklyBalance={data?.weeklyBalance}
                    mealTiming={data?.mealTiming}
                    timingRecommendations={data?.timingRecommendations}
                    isLoading={isLoading}
                  />
                </ErrorBoundary>

                <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load health insights" />}>
                  <HealthInsights weeklyScore={data?.weeklyScore} isLoading={isLoading} />
                </ErrorBoundary>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
