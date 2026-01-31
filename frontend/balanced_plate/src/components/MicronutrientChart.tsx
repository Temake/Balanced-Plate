import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pill, TrendingUp } from 'lucide-react';

interface MicronutrientData {
  name: string;
  current: number;
  recommended: number;
  unit: string;
  color: string;
}

interface MicronutrientChartProps {
  className?: string;
}

const micronutrientData: MicronutrientData[] = [
  { name: 'Vitamin C', current: 85, recommended: 90, unit: 'mg', color: '#f59e0b' },
  { name: 'Vitamin D', current: 15, recommended: 20, unit: 'μg', color: '#3b82f6' },
  { name: 'Iron', current: 12, recommended: 18, unit: 'mg', color: '#ef4444' },
  { name: 'Calcium', current: 950, recommended: 1000, unit: 'mg', color: '#10b981' },
  { name: 'Zinc', current: 8, recommended: 11, unit: 'mg', color: '#8b5cf6' },
  { name: 'B12', current: 2.2, recommended: 2.4, unit: 'μg', color: '#06b6d4' },
  { name: 'Folate', current: 380, recommended: 400, unit: 'μg', color: '#84cc16' },
  { name: 'Magnesium', current: 280, recommended: 320, unit: 'mg', color: '#f97316' }
];

const MicronutrientChart: React.FC<MicronutrientChartProps> = ({ className = '' }) => {
  const chartData = micronutrientData.map(nutrient => ({
    ...nutrient,
    percentage: Math.round((nutrient.current / nutrient.recommended) * 100)
  }));

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Pill className="mr-2 sm:mr-3 text-blue-600 dark:text-blue-400" size={20} />
          Micronutrients Tracking
        </h3>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="mr-1" size={16} />
          Daily Progress
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-600" />
            <XAxis 
              dataKey="name" 
              stroke="#666" 
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={80}
              className="dark:stroke-gray-400"
            />
            <YAxis 
              stroke="#666" 
              fontSize={10} 
              domain={[0, 120]}
              className="dark:stroke-gray-400"
              label={{ value: '% of RDA', angle: -90, position: 'insideLeft' }}
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
                `${value ?? 0}% (${props.payload.current}${props.payload.unit})`,
                name ?? ''
              ]}
            />
            <Bar 
              dataKey="percentage" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.percentage >= 100 ? '#10b981' : entry.percentage >= 75 ? '#f59e0b' : '#ef4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nutrient Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {micronutrientData.slice(0, 4).map((nutrient, index) => {
          const percentage = Math.round((nutrient.current / nutrient.recommended) * 100);
          return (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {nutrient.name}
                </span>
                <span className={`text-xs font-bold ${
                  percentage >= 100 ? 'text-green-600 dark:text-green-400' :
                  percentage >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage >= 100 ? 'bg-green-500' :
                    percentage >= 75 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {nutrient.current}/{nutrient.recommended} {nutrient.unit}
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
          <Pill className="inline mr-1" size={14} />
          {chartData.filter(n => n.percentage >= 100).length} of {chartData.length} micronutrients 
          meet daily recommendations. Focus on Vitamin D and Iron intake.
        </p>
      </div>
    </div>
  );
};

export default MicronutrientChart;
