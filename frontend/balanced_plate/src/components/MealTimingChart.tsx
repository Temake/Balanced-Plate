import React from 'react';
import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, Coffee, Sun, Moon } from 'lucide-react';

interface MealTimingData {
  hour: number;
  timeLabel: string;
  calories: number;
  mealType: string;
  frequency: number;
}

interface MealTimingProps {
  className?: string;
}

const mealTimingData: MealTimingData[] = [
  { hour: 6, timeLabel: '6 AM', calories: 0, mealType: '', frequency: 0 },
  { hour: 7, timeLabel: '7 AM', calories: 320, mealType: 'Breakfast', frequency: 85 },
  { hour: 8, timeLabel: '8 AM', calories: 180, mealType: 'Breakfast', frequency: 65 },
  { hour: 9, timeLabel: '9 AM', calories: 120, mealType: 'Snack', frequency: 30 },
  { hour: 10, timeLabel: '10 AM', calories: 80, mealType: 'Snack', frequency: 25 },
  { hour: 11, timeLabel: '11 AM', calories: 60, mealType: 'Snack', frequency: 20 },
  { hour: 12, timeLabel: '12 PM', calories: 450, mealType: 'Lunch', frequency: 90 },
  { hour: 13, timeLabel: '1 PM', calories: 380, mealType: 'Lunch', frequency: 75 },
  { hour: 14, timeLabel: '2 PM', calories: 150, mealType: 'Lunch', frequency: 40 },
  { hour: 15, timeLabel: '3 PM', calories: 100, mealType: 'Snack', frequency: 45 },
  { hour: 16, timeLabel: '4 PM', calories: 90, mealType: 'Snack', frequency: 35 },
  { hour: 17, timeLabel: '5 PM', calories: 80, mealType: 'Snack', frequency: 30 },
  { hour: 18, timeLabel: '6 PM', calories: 200, mealType: 'Dinner', frequency: 40 },
  { hour: 19, timeLabel: '7 PM', calories: 480, mealType: 'Dinner', frequency: 95 },
  { hour: 20, timeLabel: '8 PM', calories: 380, mealType: 'Dinner', frequency: 80 },
  { hour: 21, timeLabel: '9 PM', calories: 150, mealType: 'Snack', frequency: 25 },
  { hour: 22, timeLabel: '10 PM', calories: 80, mealType: 'Snack', frequency: 15 },
];

// const getMealIcon = (hour: number) => {
//   if (hour >= 6 && hour <= 10) return <Coffee className="w-4 h-4 text-orange-500" />;
//   if (hour >= 11 && hour <= 14) return <Sun className="w-4 h-4 text-yellow-500" />;
//   if (hour >= 17 && hour <= 21) return <Moon className="w-4 h-4 text-blue-500" />;
//   return null;
// };

const MealTimingChart: React.FC<MealTimingProps> = ({ className = '' }) => {
//   const filteredData = 
mealTimingData
    .filter(data => data.calories > 300)
    .map(data => ({ hour: data.hour, type: data.mealType, calories: data.calories }));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Clock className="mr-2 sm:mr-3 text-green-600 dark:text-green-400" size={20} />
          Meal Timing Patterns
        </h3>
        <div className="flex items-center space-x-2">
          <Coffee className="w-4 h-4 text-orange-500" />
          <Sun className="w-4 h-4 text-yellow-500" />
          <Moon className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mealTimingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="caloriesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
            <XAxis 
              dataKey="timeLabel" 
              stroke="#666" 
              fontSize={10}
              className="dark:stroke-gray-400"
              interval={1}
            />
            <YAxis 
              stroke="#666" 
              fontSize={10} 
              className="dark:stroke-gray-400"
              label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-gray-800 dark:[&_.recharts-tooltip-wrapper]:!border-gray-600 dark:[&_.recharts-tooltip-wrapper]:!text-white"
              formatter={(value: number | undefined, name: string | undefined, props: any) => [
                `${value ?? 0} calories`,
                props.payload.mealType || name || 'No Meal Found'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
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

      {/* Meal Pattern Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
          <div className="flex items-center mb-2">
            <Coffee className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Breakfast</span>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400">Peak: 7-8 AM</p>
          <p className="text-xs text-orange-600 dark:text-orange-400">Avg: 240 calories</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center mb-2">
            <Sun className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Lunch</span>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Peak: 12-1 PM</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">Avg: 325 calories</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center mb-2">
            <Moon className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Dinner</span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">Peak: 7-8 PM</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Avg: 350 calories</p>
        </div>
      </div>

      {/* Insights */}
      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
          <Clock className="inline mr-1" size={14} />
          Your eating pattern shows consistent meal timing. Consider reducing late-night snacking after 9 PM for better digestion.
        </p>
      </div>
    </div>
  );
};

export default MealTimingChart;
