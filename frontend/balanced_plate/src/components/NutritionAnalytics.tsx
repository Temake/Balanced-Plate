import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingDown, BarChart3, Target, Activity } from 'lucide-react';

interface FoodClassData {
  foodClass: string;
  count: number;
  percentage: number;
  color: string;
}

interface BalancedDietData {
  day: string;
  balanced: number;
  target: number;
}

interface NutritionAnalyticsProps {
  className?: string;
}

const foodClassData: FoodClassData[] = [
  { foodClass: 'Carbohydrates', count: 45, percentage: 35, color: '#3b82f6' },
  { foodClass: 'Proteins', count: 32, percentage: 25, color: '#10b981' },
  { foodClass: 'Vegetables', count: 28, percentage: 22, color: '#22c55e' },
  { foodClass: 'Fruits', count: 18, percentage: 14, color: '#f59e0b' },
  { foodClass: 'Dairy', count: 5, percentage: 4, color: '#8b5cf6' }
];

const balancedDietData: BalancedDietData[] = [
  { day: 'Mon', balanced: 75, target: 80 },
  { day: 'Tue', balanced: 82, target: 80 },
  { day: 'Wed', balanced: 68, target: 80 },
  { day: 'Thu', balanced: 85, target: 80 },
  { day: 'Fri', balanced: 71, target: 80 },
  { day: 'Sat', balanced: 88, target: 80 },
  { day: 'Sun', balanced: 79, target: 80 }
];

const NutritionAnalytics: React.FC<NutritionAnalyticsProps> = ({ className = '' }) => {
  const [chartType, setChartType] = useState<string>('bar');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white flex items-center">
          <BarChart3 className="mr-2 sm:mr-3 text-purple-600 dark:text-green-500" size={20} />
          Nutrition Analytics
        </h2>
        
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              chartType === 'bar' 
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-green-400 shadow' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Food Classes
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              chartType === 'pie' 
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-green-400 shadow' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Distribution
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              chartType === 'line' 
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-green-400 shadow' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            Weekly Balance
          </button>
        </div>
      </div>

      {/* Chart Display */}
      <div className="h-64 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={foodClassData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="foodClass" 
                stroke="#666" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
                className="dark:stroke-gray-400"
              />
              <YAxis stroke="#666" fontSize={10} className="dark:stroke-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-gray-800 dark:[&_.recharts-tooltip-wrapper]:!border-gray-600 dark:[&_.recharts-tooltip-wrapper]:!text-white"
              />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 0, 0]}
              >
                {foodClassData.map((entry: FoodClassData, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={foodClassData as any[]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                name=""
                label={({ payload }: any) => `${payload.foodClass} ${payload.percentage}%`}
                labelLine={false}
              >
                {foodClassData.map((entry: FoodClassData, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number | undefined, _name: string | undefined, props: any) => [`${value ?? 0} items (${props.payload.percentage}%)`, props.payload.foodClass]}
              />
            </PieChart>
          ) : (
            <LineChart data={balancedDietData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
              <XAxis dataKey="day" stroke="#666" fontSize={10} className="dark:stroke-gray-400" />
              <YAxis stroke="#666" fontSize={10} domain={[0, 100]} className="dark:stroke-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-gray-800 dark:[&_.recharts-tooltip-wrapper]:!border-gray-600 dark:[&_.recharts-tooltip-wrapper]:!text-white"
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="balanced" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                name="Balance Score"
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
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Description */}
      <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        {chartType === 'bar' && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <TrendingDown className="inline mr-1" size={14} />
            Food classes you consume most to least: Carbohydrates lead your diet, followed by proteins and vegetables.
          </p>
        )}
        {chartType === 'pie' && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <Target className="inline mr-1" size={14} />
            Distribution of food classes in your diet over the past 30 days.
          </p>
        )}
        {chartType === 'line' && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <Activity className="inline mr-1" size={14} />
            Your weekly diet balance score. Target is 80% for optimal nutrition.
          </p>
        )}
      </div>
    </div>
  );
};

export default NutritionAnalytics;
