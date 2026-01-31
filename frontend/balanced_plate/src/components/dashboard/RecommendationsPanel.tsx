import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  Leaf,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingUp,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export type TimeFilter = 'today' | 'week' | 'month' | 'all';

export interface Recommendation {
  id: string;
  type: 'warning' | 'success' | 'tip' | 'diet' | 'balance';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category?: 'nutrition' | 'vitamins' | 'timing' | 'general';
}

interface RecommendationsPanelProps {
  recommendations?: Recommendation[];
  isLoading?: boolean;
  className?: string;
  onTimeFilterChange?: (filter: TimeFilter) => void;
  timeFilter?: TimeFilter;
}

// Mock recommendations - will be replaced with backend data later
export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Increase Iron Intake',
    description: 'Your iron levels are at 67% of daily requirements. Consider adding spinach, lentils, or lean red meat to your meals.',
    priority: 'high',
    category: 'vitamins'
  },
  {
    id: '2',
    type: 'tip',
    title: 'Add More Vegetables',
    description: 'Your vegetable intake is below recommended levels. Try adding a side salad to your lunch.',
    priority: 'medium',
    category: 'nutrition'
  },
  {
    id: '3',
    type: 'success',
    title: 'Great Protein Balance!',
    description: 'You\'ve consistently met your protein goals this week. Keep up the excellent work!',
    priority: 'low',
    category: 'nutrition'
  },
  {
    id: '4',
    type: 'tip',
    title: 'Consider Earlier Dinner',
    description: 'Your dinner timing has been late. Eating earlier may improve digestion and sleep quality.',
    priority: 'medium',
    category: 'timing'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Vitamin D Deficiency',
    description: 'Your Vitamin D intake is only 75% of recommended daily value. Consider fortified foods or supplements.',
    priority: 'high',
    category: 'vitamins'
  }
];

const getCategoryConfig = (category?: string, type?: string) => {
  if (category === 'vitamins') return { 
    icon: Leaf, 
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/20',
    lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30'
  };
  if (category === 'timing') return { 
    icon: Clock, 
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/20',
    lightBg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30'
  };
  if (category === 'nutrition' || type === 'diet') return { 
    icon: Leaf, 
    gradient: 'from-emerald-500 to-green-500',
    bgGlow: 'bg-emerald-500/20',
    lightBg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30'
  };
  if (type === 'balance') return { 
    icon: TrendingUp, 
    gradient: 'from-blue-500 to-indigo-500',
    bgGlow: 'bg-blue-500/20',
    lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30'
  };
  if (type === 'success') return { 
    icon: CheckCircle2, 
    gradient: 'from-green-500 to-emerald-500',
    bgGlow: 'bg-green-500/20',
    lightBg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30'
  };
  if (type === 'warning') return { 
    icon: AlertTriangle, 
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/20',
    lightBg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30'
  };
  return { 
    icon: Lightbulb, 
    gradient: 'from-blue-500 to-indigo-500',
    bgGlow: 'bg-blue-500/20',
    lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30'
  };
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm">
          <Zap className="w-2.5 h-2.5" />
          Urgent
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
          Important
        </span>
      );
    default:
      return null;
  }
};

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  recommendations = [], 
  isLoading,
  className = '',
  onTimeFilterChange,
  timeFilter = 'week'
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Sync local state with prop when it changes from parent
  useEffect(() => {
    setActiveIndex(0); // Reset to first recommendation when filter changes
  }, [timeFilter]);

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setActiveIndex(0);
    onTimeFilterChange?.(filter);
  };

  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  // Sort by priority: high > medium > low
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const highPriorityCount = sortedRecommendations.filter(r => r.priority === 'high').length;

  const nextTip = () => {
    setActiveIndex((prev) => (prev + 1) % sortedRecommendations.length);
  };

  const prevTip = () => {
    setActiveIndex((prev) => (prev - 1 + sortedRecommendations.length) % sortedRecommendations.length);
  };

  if (isLoading) {
    return (
      <div className={`relative overflow-hidden rounded-2xl h-full ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20" />
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 h-full p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeTip = sortedRecommendations[activeIndex];
  const config = getCategoryConfig(activeTip?.category, activeTip?.type);
  const IconComponent = config.icon;

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl h-full group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20" />
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${config.bgGlow} blur-3xl transition-all duration-700 ${isHovered ? 'opacity-60 scale-110' : 'opacity-30'}`} />
      <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full ${config.bgGlow} blur-3xl transition-all duration-700 ${isHovered ? 'opacity-40 scale-110' : 'opacity-20'}`} />
      
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-gray-700/50 h-full flex flex-col shadow-xl shadow-gray-200/50 dark:shadow-none">
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                {highPriorityCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
                    {highPriorityCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Smart Insights
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Personalized for you
                </p>
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button 
                onClick={prevTip}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={nextTip}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Time Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleTimeFilterChange(filter.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                  timeFilter === filter.value
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Tip Card */}
        <div className="flex-1 px-4 pb-3">
          {sortedRecommendations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-white">No Insights Yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4 max-w-[200px]">
                Analyze your meals to get personalized recommendations
              </p>
              <Button 
                onClick={() => navigate('/analyze-food')}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                Analyze Food
              </Button>
            </div>
          ) : (
            <div 
              className={`${config.lightBg} rounded-xl p-4 h-full transition-all duration-500 border border-white/50 dark:border-gray-600/30`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {activeTip?.title}
                    </h3>
                    {getPriorityBadge(activeTip?.priority)}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {activeTip?.description}
              </p>

              <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group/btn">
                Learn more
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>

        {/* Dot Indicators & Quick Stats */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            {/* Dot Navigation */}
            <div className="flex items-center gap-1.5">
              {sortedRecommendations.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === activeIndex 
                      ? 'w-6 h-2 bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
              {sortedRecommendations.length > 5 && (
                <span className="text-[10px] text-gray-400 ml-1">+{sortedRecommendations.length - 5}</span>
              )}
            </div>

            {/* Quick tip count */}
            <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {highPriorityCount} urgent
              </span>
              <span>{sortedRecommendations.length} total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;
