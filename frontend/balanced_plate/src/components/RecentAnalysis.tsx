import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  Star, 
  TrendingUp, 
  ChevronRight,
  Flame,
  Sparkles,
  Eye,
  MoreHorizontal,
  Trophy,
  Zap
} from 'lucide-react';

interface RecentMeal {
  id: number;
  name: string;
  time: string;
  calories: number;
  balanced: number;
  image?: string;
  healthScore: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

interface RecentAnalysisProps {
  className?: string;
}

const recentMeals: RecentMeal[] = [
  { 
    id: 1, 
    name: 'Grilled Chicken Salad', 
    time: '2 hours ago', 
    calories: 450, 
    balanced: 85,
    healthScore: 'Excellent'
  },
  { 
    id: 2, 
    name: 'Pasta with Vegetables', 
    time: '5 hours ago', 
    calories: 520, 
    balanced: 72,
    healthScore: 'Good'
  },
  { 
    id: 3, 
    name: 'Fruit Smoothie', 
    time: '1 day ago', 
    calories: 280, 
    balanced: 68,
    healthScore: 'Good'
  },
  { 
    id: 4, 
    name: 'Salmon with Quinoa', 
    time: '1 day ago', 
    calories: 485, 
    balanced: 88,
    healthScore: 'Excellent'
  },
  { 
    id: 5, 
    name: 'Avocado Toast', 
    time: '2 days ago', 
    calories: 320, 
    balanced: 75,
    healthScore: 'Good'
  }
];

const getScoreConfig = (score: string, balanced: number) => {
  if (score === 'Excellent' || balanced >= 85) return {
    gradient: 'from-emerald-400 to-green-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    icon: Trophy
  };
  if (score === 'Good' || balanced >= 70) return {
    gradient: 'from-blue-400 to-cyan-500',
    bgLight: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    icon: TrendingUp
  };
  if (score === 'Fair' || balanced >= 50) return {
    gradient: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    icon: Activity
  };
  return {
    gradient: 'from-red-400 to-rose-500',
    bgLight: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/20',
    icon: Zap
  };
};

const getMealGradient = (index: number) => {
  const gradients = [
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-violet-500 via-purple-500 to-fuchsia-500',
    'from-amber-500 via-orange-500 to-red-500',
    'from-blue-500 via-indigo-500 to-violet-500',
    'from-rose-500 via-pink-500 to-fuchsia-500',
  ];
  return gradients[index % gradients.length];
};

const RecentAnalysis: React.FC<RecentAnalysisProps> = ({ className = '' }) => {
  const [hoveredMeal, setHoveredMeal] = useState<number | null>(null);
  const [selectedView, setSelectedView] = useState<'list' | 'compact'>('list');

  const averageBalance = Math.round(recentMeals.reduce((acc, meal) => acc + meal.balanced, 0) / recentMeals.length);
  const totalCalories = recentMeals.reduce((acc, meal) => acc + meal.calories, 0);
  const excellentCount = recentMeals.filter(m => m.healthScore === 'Excellent').length;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative border border-gray-200/60 dark:border-gray-700/60 rounded-2xl backdrop-blur-sm">
        {/* Header Section */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Recent Analysis
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {recentMeals.length}
                  </span>
                  meals analyzed
                </p>
              </div>
            </div>

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Stats Cards - Glassmorphism Style */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 sm:p-4 group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-100" />
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-100 uppercase tracking-wide">Balance</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{averageBalance}%</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 p-3 sm:p-4 group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-1 mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-100" />
                  <span className="text-[10px] sm:text-xs font-medium text-orange-100 uppercase tracking-wide">Calories</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{totalCalories.toLocaleString()}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 sm:p-4 group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3.5 h-3.5 text-violet-100" />
                  <span className="text-[10px] sm:text-xs font-medium text-violet-100 uppercase tracking-wide">Excellent</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{excellentCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {recentMeals.map((meal, index) => {
              const config = getScoreConfig(meal.healthScore, meal.balanced);
              const isHovered = hoveredMeal === meal.id;
              
              return (
                <div 
                  key={meal.id}
                  onMouseEnter={() => setHoveredMeal(meal.id)}
                  onMouseLeave={() => setHoveredMeal(null)}
                  className={`
                    relative group rounded-xl p-3 transition-all duration-300 cursor-pointer
                    ${isHovered 
                      ? 'bg-white dark:bg-gray-700/80 shadow-lg shadow-gray-200/50 dark:shadow-none scale-[1.02]' 
                      : 'bg-gray-50/80 dark:bg-gray-700/40 hover:bg-white dark:hover:bg-gray-700/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Meal Avatar with Gradient */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMealGradient(index)} flex items-center justify-center shadow-md transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                        <span className="text-white font-bold text-lg drop-shadow-sm">
                          {meal.name.charAt(0)}
                        </span>
                      </div>
                      {/* Score indicator dot */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${config.gradient} ring-2 ring-white dark:ring-gray-800 flex items-center justify-center`}>
                        {meal.healthScore === 'Excellent' && <Star className="w-2.5 h-2.5 text-white fill-white" />}
                      </div>
                    </div>

                    {/* Meal Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {meal.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {meal.time}
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-medium ${config.text}`}>
                          <TrendingUp className="w-3 h-3" />
                          {meal.balanced}%
                        </span>
                      </div>
                    </div>

                    {/* Calories & Score */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {meal.calories}
                          <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-0.5">cal</span>
                        </p>
                      </div>
                      
                      <div className={`
                        px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300
                        ${config.bgLight} ${config.text}
                        ${isHovered ? 'ring-2 ' + config.ring : ''}
                      `}>
                        {meal.healthScore}
                      </div>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-700/50 hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 group">
            <Eye className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              View Complete History
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default RecentAnalysis;
