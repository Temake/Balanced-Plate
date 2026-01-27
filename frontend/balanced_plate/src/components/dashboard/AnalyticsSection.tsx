import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  Legend, AreaChart, Area
} from 'recharts';
import { 
  BarChart3, PieChart as PieChartIcon, TrendingUp, Clock, 
  Activity, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export interface FoodGroupData {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number; // Index signature for recharts compatibility
}

export interface WeeklyBalanceData {
  day: string;
  balance: number;
  target: number;
  [key: string]: string | number;
}

export interface MealTimingData {
  hour: string;
  calories: number;
  mealType: string;
  [key: string]: string | number;
}

interface AnalyticsSectionProps {
  foodData?: FoodGroupData[];
  weeklyBalance?: WeeklyBalanceData[];
  mealTiming?: MealTimingData[];
  timingRecommendations?: string[];
  isLoading?: boolean;
  className?: string;
}

// Mock data for food groups
const mockFoodData: FoodGroupData[] = [
  { name: 'Carbs', value: 45, percentage: 35, color: '#3b82f6' },
  { name: 'Protein', value: 32, percentage: 25, color: '#10b981' },
  { name: 'Vegetables', value: 28, percentage: 22, color: '#22c55e' },
  { name: 'Fruits', value: 18, percentage: 14, color: '#f59e0b' },
  { name: 'Dairy', value: 5, percentage: 4, color: '#8b5cf6' }
];

const mockWeeklyBalance: WeeklyBalanceData[] = [
  { day: 'Mon', balance: 75, target: 80 },
  { day: 'Tue', balance: 82, target: 80 },
  { day: 'Wed', balance: 68, target: 80 },
  { day: 'Thu', balance: 85, target: 80 },
  { day: 'Fri', balance: 71, target: 80 },
  { day: 'Sat', balance: 88, target: 80 },
  { day: 'Sun', balance: 79, target: 80 }
];

const mockMealTiming: MealTimingData[] = [
  { hour: '6 AM', calories: 0, mealType: '' },
  { hour: '7 AM', calories: 320, mealType: 'Breakfast' },
  { hour: '8 AM', calories: 180, mealType: 'Breakfast' },
  { hour: '9 AM', calories: 120, mealType: 'Snack' },
  { hour: '10 AM', calories: 80, mealType: 'Snack' },
  { hour: '11 AM', calories: 60, mealType: 'Snack' },
  { hour: '12 PM', calories: 450, mealType: 'Lunch' },
  { hour: '1 PM', calories: 380, mealType: 'Lunch' },
  { hour: '2 PM', calories: 150, mealType: 'Lunch' },
  { hour: '3 PM', calories: 100, mealType: 'Snack' },
  { hour: '4 PM', calories: 90, mealType: 'Snack' },
  { hour: '5 PM', calories: 80, mealType: 'Snack' },
  { hour: '6 PM', calories: 200, mealType: 'Dinner' },
  { hour: '7 PM', calories: 480, mealType: 'Dinner' },
  { hour: '8 PM', calories: 380, mealType: 'Dinner' },
  { hour: '9 PM', calories: 150, mealType: 'Snack' },
  { hour: '10 PM', calories: 80, mealType: 'Snack' },
];

type TabType = 'distribution' | 'balance' | 'timing';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ElementType;
  shortLabel: string;
}

const tabs: Tab[] = [
  { id: 'distribution', label: 'Food Distribution', icon: PieChartIcon, shortLabel: 'Food' },
  { id: 'balance', label: 'Weekly Balance', icon: TrendingUp, shortLabel: 'Balance' },
  { id: 'timing', label: 'Meal Recommendations', icon: Clock, shortLabel: 'Timing' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.payload?.unit ? entry.payload.unit : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  foodData,
  weeklyBalance,
  mealTiming,
  timingRecommendations = [],
  isLoading,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('distribution');
  const navigate = useNavigate();

  // Check if we have real data
  const hasFoodData = foodData && foodData.length > 0 && foodData.some(d => d.value > 0);
  const hasWeeklyBalance = weeklyBalance && weeklyBalance.length > 0 && weeklyBalance.some(d => d.balance > 0);
  const hasMealTiming = mealTiming && mealTiming.length > 0 && mealTiming.some(d => d.calories > 0);
  const hasAnyData = hasFoodData || hasWeeklyBalance || hasMealTiming;

  // Use mock data only for display purposes when there's no real data
  const displayFoodData = hasFoodData ? foodData : mockFoodData;
  const displayWeeklyBalance = hasWeeklyBalance ? weeklyBalance : mockWeeklyBalance;
  const displayMealTiming = hasMealTiming ? mealTiming : mockMealTiming;

  // Empty state component
  const EmptyState = ({ type }: { type: string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
        {type === 'distribution' && <PieChartIcon className="w-8 h-8 text-purple-500" />}
        {type === 'balance' && <TrendingUp className="w-8 h-8 text-green-500" />}
        {type === 'timing' && <Clock className="w-8 h-8 text-blue-500" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {type === 'distribution' && 'No Food Data Yet'}
        {type === 'balance' && 'No Balance Data Yet'}
        {type === 'timing' && 'No Meal Timing Data Yet'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">
        {type === 'distribution' && 'Analyze your meals to see how your food groups are distributed.'}
        {type === 'balance' && 'Track your daily meals to see your weekly nutrition balance.'}
        {type === 'timing' && 'Upload meals to receive personalized meal timing recommendations.'}
      </p>
      <Button 
        onClick={() => navigate('/analyse-food')}
        variant="outline"
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        Start Analyzing
      </Button>
    </div>
  );

  const renderDistributionChart = () => {
    if (!hasFoodData) {
      return <EmptyState type="distribution" />;
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayFoodData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="name" 
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
                className="fill-gray-600 dark:fill-gray-400"
              />
              <YAxis fontSize={11} className="fill-gray-600 dark:fill-gray-400" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {displayFoodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Pie Chart */}
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayFoodData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {displayFoodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={(_value, entry: any) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {entry.payload.name} ({entry.payload.percentage}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBalanceChart = () => {
    if (!hasWeeklyBalance) {
      return <EmptyState type="balance" />;
    }

    return (
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayWeeklyBalance} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis dataKey="day" fontSize={12} className="fill-gray-600 dark:fill-gray-400" />
            <YAxis fontSize={12} domain={[0, 100]} className="fill-gray-600 dark:fill-gray-400" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              name="Your Score"
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Target (80%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };



  const renderTimingChart = () => (
    <div>
      {/* Timing Recommendations List */}
      <div className="space-y-3 mb-4">
        {timingRecommendations && timingRecommendations.length > 0 ? (
          timingRecommendations.map((recommendation, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              No Timing Recommendations Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
              Upload and analyze meals to receive personalized timing recommendations
            </p>
            <Button 
              onClick={() => navigate('/analyse-food')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Analyze Meals
            </Button>
          </div>
        )}
      </div>

      {/* Meal Pattern Summary - only show if we have timing data */}
      {hasMealTiming && (
        <div className="h-52 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayMealTiming} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="hour" fontSize={10} interval={2} className="fill-gray-600 dark:fill-gray-400" />
              <YAxis fontSize={10} className="fill-gray-600 dark:fill-gray-400" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">{data.hour}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{data.calories} calories</p>
                        {data.mealType && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{data.mealType}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="calories" 
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#caloriesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const getInsightText = () => {
    if (!hasAnyData) {
      return 'Start analyzing your meals to get personalized nutrition insights and track your progress over time.';
    }
    switch (activeTab) {
      case 'distribution':
        return hasFoodData 
          ? 'Your diet composition shows carbohydrates as the leading food group. Consider increasing vegetable and fruit intake for better balance.'
          : 'Analyze your meals to see your food group distribution.';
      case 'balance':
        return hasWeeklyBalance 
          ? 'You exceeded your balance target on 4 out of 7 days this week. Great progress toward consistent healthy eating!'
          : 'Track your daily meals to see your weekly balance progress.';
      case 'timing':
        return timingRecommendations?.length 
          ? timingRecommendations[0] 
          : 'Upload meals to receive personalized timing recommendations.';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header with tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 sm:p-5 pb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Nutrition Analytics
          </h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto px-2 sm:px-4 mt-4 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive 
                    ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'distribution' && renderDistributionChart()}
        {activeTab === 'balance' && renderBalanceChart()}
        {activeTab === 'timing' && renderTimingChart()}

        {/* Insight Box */}
        <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
            <Activity className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span>{getInsightText()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
