import React from 'react';
import { Flame, Beef, Wheat, Droplets, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

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
    gradient: 'from-orange-400 via-orange-500 to-amber-500',
    glowColor: 'orange',
    bgPattern: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
    borderColor: 'border-orange-200/50 dark:border-orange-800/50',
    unit: 'kcal'
  },
  { 
    key: 'protein' as const, 
    label: 'Protein', 
    icon: Beef, 
    gradient: 'from-rose-400 via-red-500 to-pink-500',
    glowColor: 'rose',
    bgPattern: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
    borderColor: 'border-rose-200/50 dark:border-rose-800/50',
    unit: 'g'
  },
  { 
    key: 'carbs' as const, 
    label: 'Carbs', 
    icon: Wheat, 
    gradient: 'from-amber-400 via-yellow-500 to-orange-400',
    glowColor: 'amber',
    bgPattern: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    borderColor: 'border-amber-200/50 dark:border-amber-800/50',
    unit: 'g'
  },
  { 
    key: 'fats' as const, 
    label: 'Fats', 
    icon: Droplets, 
    gradient: 'from-blue-400 via-cyan-500 to-teal-500',
    glowColor: 'blue',
    bgPattern: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200/50 dark:border-blue-800/50',
    unit: 'g'
  },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-rose-500" />;
    default: return <Minus className="w-4 h-4 text-gray-400" />;
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return 'from-emerald-400 to-green-500';
  if (percentage >= 75) return 'from-amber-400 to-orange-500';
  return 'from-rose-400 to-red-500';
};

const NutritionSummaryCards: React.FC<NutritionSummaryCardsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {cardConfig.map((card) => (
          <div 
            key={card.key} 
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-4 animate-pulse border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cardConfig.map((card, index) => {
        const Icon = card.icon;
        const nutrient = data?.[card.key];
        const percentage = nutrient 
          ? Math.round((nutrient.value / nutrient.target) * 100) 
          : 0;

        return (
          <div 
            key={card.key} 
            className={`
              relative overflow-hidden rounded-2xl ${card.bgPattern} 
              border ${card.borderColor}
              p-3 sm:p-4 
              transition-all duration-300 
              hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none
              hover:scale-[1.02] hover:-translate-y-1
              cursor-pointer group
            `}
          >
            {/* Decorative Elements */}
            <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl`} />
            <div className={`absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity blur-lg`} />
            
            {/* Header */}
            <div className="relative flex items-center justify-between mb-3">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-sm" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                {nutrient && getTrendIcon(nutrient.trend)}
              </div>
            </div>
            
            {/* Value */}
            <div className="relative mb-3">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {nutrient?.value ?? '--'}
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">
                  {card.unit}
                </span>
              </p>
            </div>
            
            {/* Progress Section */}
            <div className="relative space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{card.label}</span>
                <span className={`font-bold px-1.5 py-0.5 rounded ${
                  percentage >= 100 
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30' 
                    : percentage >= 75 
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-900/30'
                }`}>
                  {percentage}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-white/60 dark:bg-gray-700/60 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                {/* Animated shine effect */}
                <div 
                  className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
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
