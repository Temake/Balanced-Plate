import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Zap,
  Loader2,
  ImageIcon
} from 'lucide-react';
import api from '@/api/axios';
import type { FoodAnalysis, PaginatedResponse } from '@/api/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getImageUrl } from '@/utils/imageUrl';

interface RecentAnalysisProps {
  className?: string;
  limit?: number;
  onViewAll?: () => void;
}

// Fetch recent analyses
const fetchRecentAnalyses = async (limit: number = 5): Promise<FoodAnalysis[]> => {
  const response = await api.get<PaginatedResponse<FoodAnalysis>>('/results/', {
    params: { page_size: limit },
  });
  return response.data.results || [];
};

// Format date relative to now
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Get health score label from balance score
const getHealthScore = (balanceScore: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' => {
  if (balanceScore >= 85) return 'Excellent';
  if (balanceScore >= 70) return 'Good';
  if (balanceScore >= 50) return 'Fair';
  return 'Poor';
};

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

// Get meal name from detected foods
const getMealName = (analysis: FoodAnalysis): string => {
  if (analysis.detected_foods && analysis.detected_foods.length > 0) {
    const topFood = analysis.detected_foods[0];
    if (analysis.detected_foods.length > 1) {
      return `${topFood.name} + ${analysis.detected_foods.length - 1} more`;
    }
    return topFood.name;
  }
  return analysis.meal_type || 'Food Analysis';
};

// Analysis Detail Modal
interface AnalysisDetailModalProps {
  analysis: FoodAnalysis | null;
  open: boolean;
  onClose: () => void;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ analysis, open, onClose }) => {
  if (!analysis) return null;

  const balanceScore = parseFloat(analysis.balance_score);
  const healthScore = getHealthScore(balanceScore);
  const config = getScoreConfig(healthScore, balanceScore);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Analysis Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden">
            <img
              src={getImageUrl(analysis.image_url)}
              alt="Food"
              className="w-full h-full object-cover"
            />
            {analysis.meal_type && (
              <div className="absolute top-2 left-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                {analysis.meal_type}
              </div>
            )}
            <div className={`absolute top-2 right-2 px-3 py-1 ${config.bgLight} backdrop-blur-sm rounded-full`}>
              <span className={`text-sm font-bold ${config.text}`}>
                {balanceScore.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {parseFloat(analysis.total_calories).toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">Calories</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {parseFloat(analysis.total_protein).toFixed(0)}g
              </div>
              <div className="text-xs text-gray-500">Protein</div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
              <Activity className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {parseFloat(analysis.total_carbs).toFixed(0)}g
              </div>
              <div className="text-xs text-gray-500">Carbs</div>
            </div>
          </div>

          {/* Detected Foods */}
          {analysis.detected_foods && analysis.detected_foods.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Detected Foods
              </h4>
              <div className="space-y-2">
                {analysis.detected_foods.slice(0, 5).map((food) => (
                  <div key={food.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{food.name}</span>
                    <span className="text-xs text-gray-500">{parseFloat(food.calories).toFixed(0)} cal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Clock className="w-3 h-3" />
            Analyzed {formatRelativeTime(analysis.date_added)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RecentAnalysis: React.FC<RecentAnalysisProps> = ({ className = '', limit = 5, onViewAll }) => {
  const [hoveredMeal, setHoveredMeal] = useState<number | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodAnalysis | null>(null);

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ['recentAnalyses', limit],
    queryFn: () => fetchRecentAnalyses(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate stats from real data
  const completedAnalyses = analyses.filter(a => a.analysis_status === 'analysis_completed');
  const averageBalance = completedAnalyses.length > 0
    ? Math.round(completedAnalyses.reduce((acc, a) => acc + parseFloat(a.balance_score), 0) / completedAnalyses.length)
    : 0;
  const totalCalories = completedAnalyses.reduce((acc, a) => acc + parseFloat(a.total_calories), 0);
  const excellentCount = completedAnalyses.filter(a => parseFloat(a.balance_score) >= 85).length;

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900" />
        <div className="relative border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

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
                    {completedAnalyses.length}
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
                <p className="text-xl sm:text-2xl font-bold text-white">{Math.round(totalCalories).toLocaleString()}</p>
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
          {completedAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No analyses yet. Upload food images to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {completedAnalyses.map((analysis, index) => {
                const balanceScore = parseFloat(analysis.balance_score);
                const healthScore = getHealthScore(balanceScore);
                const config = getScoreConfig(healthScore, balanceScore);
                const isHovered = hoveredMeal === analysis.id;
                const mealName = getMealName(analysis);
                const calories = parseFloat(analysis.total_calories);
                
                return (
                  <div 
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    onMouseEnter={() => setHoveredMeal(analysis.id)}
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
                      {/* Meal Avatar with Gradient or Image */}
                      <div className="relative flex-shrink-0">
                        {analysis.image_url ? (
                          <div className={`w-12 h-12 rounded-xl overflow-hidden shadow-md transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                            <img 
                              src={getImageUrl(analysis.image_url)} 
                              alt={mealName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getMealGradient(index)} flex items-center justify-center shadow-md transition-transform duration-300 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
                            <span className="text-white font-bold text-lg drop-shadow-sm">
                              {mealName.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Score indicator dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${config.gradient} ring-2 ring-white dark:ring-gray-800 flex items-center justify-center`}>
                          {healthScore === 'Excellent' && <Star className="w-2.5 h-2.5 text-white fill-white" />}
                        </div>
                      </div>

                      {/* Meal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {mealName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatRelativeTime(analysis.date_added)}
                          </span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${config.text}`}>
                            <TrendingUp className="w-3 h-3" />
                            {balanceScore.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Calories & Score */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {calories.toFixed(0)}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-0.5">cal</span>
                          </p>
                        </div>
                        
                        <div className={`
                          px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300
                          ${config.bgLight} ${config.text}
                          ${isHovered ? 'ring-2 ' + config.ring : ''}
                        `}>
                          {healthScore}
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
          )}
        </div>

        {/* Footer Action */}
        {onViewAll && (
          <div className="px-4 sm:px-5 pb-4 sm:pb-5">
            <button 
              onClick={onViewAll}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-700/50 hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 border border-gray-200/50 dark:border-gray-600/50 transition-all duration-300 group"
            >
              <Eye className="w-4 h-4 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                View Complete History
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        )}
      </div>

      {/* Analysis Detail Modal */}
      <AnalysisDetailModal
        analysis={selectedAnalysis}
        open={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />

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
