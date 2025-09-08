import React from 'react';
import { Activity, Clock, Star, TrendingUp } from 'lucide-react';

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

const getHealthScoreColor = (score: string, balanced: number) => {
  if (score === 'Excellent' || balanced >= 85) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
  if (score === 'Good' || balanced >= 70) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
  if (score === 'Fair' || balanced >= 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
  return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
};

const getBalanceIcon = (balanced: number) => {
  if (balanced >= 85) return <Star className="w-4 h-4 text-green-500" />;
  if (balanced >= 70) return <TrendingUp className="w-4 h-4 text-blue-500" />;
  return <Activity className="w-4 h-4 text-yellow-500" />;
};

const RecentAnalysis: React.FC<RecentAnalysisProps> = ({ className = '' }) => {
  const averageBalance = Math.round(recentMeals.reduce((acc, meal) => acc + meal.balanced, 0) / recentMeals.length);
  const totalCalories = recentMeals.reduce((acc, meal) => acc + meal.calories, 0);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <Activity className="mr-2 sm:mr-3 text-orange-500 dark:text-orange-400" size={20} />
          Recent Analysis
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {recentMeals.length} meals analyzed
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Balance</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{averageBalance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-60" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Calories</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalCalories}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Recent Meals List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentMeals.map((meal: RecentMeal) => (
          <div 
            key={meal.id} 
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Placeholder for meal image */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {meal.name.charAt(0)}
                </span>
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {meal.name}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{meal.calories} cal</p>
                <div className="flex items-center space-x-1">
                  {getBalanceIcon(meal.balanced)}
                  <p className="text-xs text-green-600 dark:text-green-400">{meal.balanced}%</p>
                </div>
              </div>
              
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthScoreColor(meal.healthScore, meal.balanced)}`}>
                {meal.healthScore}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
          View All Analysis History →
        </button>
      </div>
    </div>
  );
};

export default RecentAnalysis;
