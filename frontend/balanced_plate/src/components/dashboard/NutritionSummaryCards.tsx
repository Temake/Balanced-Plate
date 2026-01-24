import React from 'react';
import { Flame, Beef, Wheat, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NutrientData {
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

interface NutritionSummary {
  calories: NutrientData;
  protein: NutrientData;
  carbs: NutrientData;
  fats: NutrientData;
}

interface NutritionSummaryCardsProps {
  data?: NutritionSummary;
  isLoading?: boolean;
}

const cardConfig = [
  { 
    key: 'calories' as const, 
    label: 'Calories', 
    icon: Flame, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    unit: 'kcal'
  },
  { 
    key: 'protein' as const, 
    label: 'Protein', 
    icon: Beef, 
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    unit: 'g'
  },
  { 
    key: 'carbs' as const, 
    label: 'Carbs', 
    icon: Wheat, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    unit: 'g'
  },
  { 
    key: 'fats' as const, 
    label: 'Fats', 
    icon: Droplets, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    unit: 'g'
  },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
    default: return <Minus className="w-4 h-4 text-gray-400" />;
  }
};

const NutritionSummaryCards: React.FC<NutritionSummaryCardsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {cardConfig.map((card) => (
          <div 
            key={card.key} 
            className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        const nutrient = data?.[card.key];
        const percentage = nutrient 
          ? Math.round((nutrient.value / nutrient.target) * 100) 
          : 0;

        return (
          <div 
            key={card.key} 
            className={`${card.bgColor} rounded-xl p-3 sm:p-4 border ${card.borderColor} transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-white/50 dark:bg-gray-800/50`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.color}`} />
              </div>
              {nutrient && getTrendIcon(nutrient.trend)}
            </div>
            
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {nutrient?.value ?? '--'}
              <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                {card.unit}
              </span>
            </p>
            
            <div className="mt-2 sm:mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium">{card.label}</span>
                <span className={`font-semibold ${
                  percentage >= 100 ? 'text-green-600 dark:text-green-400' : 
                  percentage >= 75 ? 'text-amber-600 dark:text-amber-400' : 
                  'text-red-600 dark:text-red-400'
                }`}>
                  {percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 sm:h-2 bg-white/60 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 100 ? 'bg-green-500' : 
                    percentage >= 75 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                Target: {nutrient?.target ?? '--'} {card.unit}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NutritionSummaryCards;
