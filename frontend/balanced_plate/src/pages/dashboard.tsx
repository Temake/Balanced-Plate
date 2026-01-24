import React, { useState } from "react";
import Header from "@/components/Header";
import QuickActionButton from "@/components/QuickActionButton";
import RecentAnalysis from "@/components/RecentAnalysis";
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
import { Utensils, RefreshCw } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const { data, isLoading, error, refetch } = useNutritionAnalytics(dateRange);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        {/* Welcome Section & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-6 h-6 text-green-600 dark:text-green-400" />
              {getGreeting()}, {user?.first_name || 'there'}!
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track your nutrition and get personalized insights for a healthier you.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => refetch()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <QuickActionButton />
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error} - Showing cached/default data.
            </p>
          </div>
        )}

        {/* Summary Cards + Recommendations Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="xl:col-span-2">
            <NutritionSummaryCards data={data?.summary} isLoading={isLoading} />
          </div>
          <div className="xl:col-span-1">
            <RecommendationsPanel 
              recommendations={data?.recommendations} 
              isLoading={isLoading} 
            />
          </div>
        </div>

        {/* Main Analytics Section - Tabbed */}
        <div className="mb-6">
          <AnalyticsSection 
            foodData={data?.foodGroups}
            weeklyBalance={data?.weeklyBalance}
            micronutrients={data?.micronutrients}
            mealTiming={data?.mealTiming}
            isLoading={isLoading}
          />
        </div>

        {/* Bottom Row: Recent Analysis + Health Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <RecentAnalysis className="h-full" />
          <HealthInsights 
            weeklyScore={data?.weeklyScore}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;