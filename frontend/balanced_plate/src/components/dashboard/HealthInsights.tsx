import React from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp,
  Calendar,
  Award,
  Star,
  Camera,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

interface WeeklyScoreData {
  currentScore: number;
  previousScore: number;
  streak: number;
  bestDay: string;
  totalMealsAnalyzed: number;
  goalsMet: number;
  totalGoals: number;
}

interface HealthInsightsProps {
  weeklyScore?: WeeklyScoreData;
  isLoading?: boolean;
  className?: string;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ 
  weeklyScore,
  isLoading,
  className = ''
}) => {
  const navigate = useNavigate();
  const hasData = weeklyScore && weeklyScore.totalMealsAnalyzed > 0;
  const scoreDiff = weeklyScore ? weeklyScore.currentScore - weeklyScore.previousScore : 0;
  const isImproving = scoreDiff > 0;

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 h-full ${className}`}>
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no data
  if (!hasData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Weekly Health Score
          </h2>
        </div>
        <div className="p-8 sm:p-12 text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Health Score Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Upload and analyze your food images to track your weekly health score and nutrition progress.
          </p>
          <Button 
            onClick={() => navigate('/analyze-food')}
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Camera className="w-4 h-4" />
            Start Analyzing Food
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Weekly Health Score
        </h2>
      </div>

      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Score Card */}
          <div className={`bg-gradient-to-br ${getScoreBgColor(weeklyScore.currentScore)} rounded-xl p-4 sm:p-5 text-white relative overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/80 text-sm font-medium">This Week</span>
                <div className={`flex items-center gap-1 text-sm ${isImproving ? 'text-green-200' : 'text-red-200'}`}>
                  <TrendingUp className={`w-4 h-4 ${!isImproving && 'rotate-180'}`} />
                  {isImproving ? '+' : ''}{scoreDiff}%
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <span className="text-4xl sm:text-5xl font-bold">{weeklyScore.currentScore}</span>
                <span className="text-xl text-white/70 mb-1">/100</span>
              </div>
              
              <p className="text-white/80 text-sm mt-2">
                {weeklyScore.currentScore >= 80 
                  ? 'Excellent! Keep up the great work!' 
                  : weeklyScore.currentScore >= 60 
                    ? 'Good progress! Room for improvement.' 
                    : 'Let\'s work on improving your score!'}
              </p>
            </div>
          </div>

          {/* Stats Grid - takes 2 columns on lg */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Streak */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Streak</span>
              </div>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {weeklyScore.streak} days
              </p>
            </div>

            {/* Best Day */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Best Day</span>
              </div>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {weeklyScore.bestDay}
              </p>
            </div>

            {/* Meals Analyzed */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Meals</span>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {weeklyScore.totalMealsAnalyzed}
              </p>
            </div>

            {/* Goals Met */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Goals Met</span>
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {weeklyScore.goalsMet}/{weeklyScore.totalGoals}
              </p>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        {weeklyScore.streak >= 5 && (
          <div className="flex items-center gap-3 p-3 mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <Award className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {weeklyScore.streak} Day Streak! 🎉
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Keep going to unlock the weekly champion badge!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthInsights;
