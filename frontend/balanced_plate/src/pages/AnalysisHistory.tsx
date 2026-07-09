import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Flame,
  Loader2,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Utensils,
  ImageIcon,
} from 'lucide-react';
import api from '@/api/axios';
import type { FoodAnalysis, PaginatedResponse } from '@/api/types';
import { getImageUrl, normalizeScore } from '@/utils/imageUrl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header, { BOTTOM_NAV_HEIGHT } from '@/components/Header';
import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/hooks/useAuth';

type StatusFilter = 'all' | 'analysis_completed' | 'analysis_processing' | 'analysis_pending' | 'analysis_failed';

const PAGE_SIZE = 12;

const fetchAnalyses = async (page: number): Promise<PaginatedResponse<FoodAnalysis>> => {
  const offset = (page - 1) * PAGE_SIZE;
  const response = await api.get('/results/', {
    params: { limit: PAGE_SIZE, offset },
  });
  return response.data;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

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
  return formatDate(dateString);
};

const getScoreColor = (score: number) => {
  if (score >= 80) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-green-500', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-500 to-cyan-500', label: 'Good' };
  if (score >= 40) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-orange-500', label: 'Fair' };
  return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', gradient: 'from-red-500 to-rose-500', label: 'Poor' };
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'analysis_completed':
      return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Completed' };
    case 'analysis_processing':
      return { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Processing' };
    case 'analysis_pending':
      return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Pending' };
    case 'analysis_failed':
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Failed' };
    default:
      return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', label: 'Unknown' };
  }
};

// Detail Modal
const AnalysisDetailModal: React.FC<{
  analysis: FoodAnalysis | null;
  open: boolean;
  onClose: () => void;
}> = ({ analysis, open, onClose }) => {
  if (!analysis) return null;
  const score = normalizeScore(analysis.balance_score);
  const scoreColor = getScoreColor(score);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-green-600" />
            Analysis Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image + Score */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={getImageUrl(analysis.image_url)}
                alt="Food"
                className="w-full h-full object-cover"
              />
              {analysis.meal_type && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                  {analysis.meal_type}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div className={`p-4 rounded-xl ${scoreColor.bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Score</span>
                  <div className={`text-3xl font-bold ${scoreColor.text}`}>
                    {score.toFixed(0)}%
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${scoreColor.gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                  <Flame className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {parseFloat(analysis.total_calories).toFixed(0)}
                  </div>
                  <div className="text-[10px] text-gray-500">Calories</div>
                </div>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <TrendingUp className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {parseFloat(analysis.total_protein).toFixed(0)}g
                  </div>
                  <div className="text-[10px] text-gray-500">Protein</div>
                </div>
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <Sparkles className="w-4 h-4 text-green-500 mx-auto mb-0.5" />
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {parseFloat(analysis.total_carbs).toFixed(0)}g
                  </div>
                  <div className="text-[10px] text-gray-500">Carbs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Foods */}
          {analysis.detected_foods && analysis.detected_foods.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Detected Foods ({analysis.detected_foods.length})
              </h4>
              <div className="space-y-2">
                {analysis.detected_foods.map((food) => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{food.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {food.portion_estimate} • {normalizeScore(food.confidence).toFixed(0)}% confident
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {parseFloat(food.calories).toFixed(0)} cal
                      </div>
                      <div className="text-xs text-gray-500">
                        P: {parseFloat(food.protein).toFixed(0)}g • C: {parseFloat(food.carbs).toFixed(0)}g • F: {parseFloat(food.fat).toFixed(0)}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(analysis.conversational_feedback || analysis.actionable_suggestion || analysis.alternative_suggestion) && (
            <div className="space-y-3">
              {analysis.conversational_feedback && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/20">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {analysis.conversational_feedback}
                  </p>
                </div>
              )}
              {analysis.actionable_suggestion && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 dark:border-amber-800/30 dark:bg-amber-900/15">
                  <p className="mb-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">Recommended next step</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.actionable_suggestion}</p>
                </div>
              )}
              {analysis.alternative_suggestion && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-800/30 dark:bg-blue-900/15">
                  <p className="mb-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">Suggested swap</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.alternative_suggestion}</p>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(analysis.date_added)} at {formatTime(analysis.date_added)}
            </span>
            {analysis.is_mock_data && (
              <span className="text-amber-500 font-medium">Demo data</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Page
const AnalysisHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodAnalysis | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.foodAnalyses.list({ userId: user?.id, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    queryFn: () => fetchAnalyses(page),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    refetchInterval: (query) => {
      const results = query.state.data?.results;
      const hasPending = results?.some(
        (a) => a.analysis_status === 'analysis_pending' || a.analysis_status === 'analysis_processing'
      );
      return hasPending ? 5000 : false;
    },
  });

  const allAnalyses = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

  // Client-side filtering
  const filteredAnalyses = allAnalyses.filter((a) => {
    if (statusFilter !== 'all' && a.analysis_status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const foodNames = a.detected_foods?.map((f) => f.name.toLowerCase()).join(' ') || '';
      const mealType = (a.meal_type || '').toLowerCase();
      if (!foodNames.includes(query) && !mealType.includes(query)) return false;
    }
    return true;
  });

  // Stats
  const completed = allAnalyses.filter((a) => a.analysis_status === 'analysis_completed');
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, a) => sum + normalizeScore(a.balance_score), 0) / completed.length)
    : 0;
  const totalCals = Math.round(completed.reduce((sum, a) => sum + parseFloat(a.total_calories || '0'), 0));

  const statusFilters: { value: StatusFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: allAnalyses.length },
    { value: 'analysis_completed', label: 'Completed', count: allAnalyses.filter((a) => a.analysis_status === 'analysis_completed').length },
    { value: 'analysis_processing', label: 'Processing', count: allAnalyses.filter((a) => a.analysis_status === 'analysis_processing' || a.analysis_status === 'analysis_pending').length },
    { value: 'analysis_failed', label: 'Failed', count: allAnalyses.filter((a) => a.analysis_status === 'analysis_failed').length },
  ];

  return (
    <div className={`min-h-screen bg-background flex flex-col ${BOTTOM_NAV_HEIGHT} md:pb-0`}>
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              Analysis History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              View all your food analysis results and trends
            </p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.count || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Analyses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className={`text-2xl font-bold ${avgScore >= 70 ? 'text-emerald-600' : avgScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {avgScore}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Balance</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalCals.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Calories</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4">
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by food name or meal type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
              />
            </div>

            {/* Status filters */}
            <div className="flex flex-wrap items-center gap-1">
              <Filter className="w-4 h-4 text-gray-400 mr-1" />
              {statusFilters.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setStatusFilter(sf.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                    statusFilter === sf.value
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {sf.label}
                  {sf.count > 0 && (
                    <span className={`ml-1 ${statusFilter === sf.value ? 'text-green-100' : 'text-gray-400'}`}>
                      ({sf.count})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No matching analyses' : 'No analyses yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Upload a food image to get your first analysis!'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => navigate('/analyze-food')} className="gap-2">
                <Camera className="w-4 h-4" />
                Analyze Food
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnalyses.map((analysis) => {
              const isCompleted = analysis.analysis_status === 'analysis_completed';
              const isProcessing = analysis.analysis_status === 'analysis_pending' || analysis.analysis_status === 'analysis_processing';
              const isFailed = analysis.analysis_status === 'analysis_failed';
              const score = isCompleted ? normalizeScore(analysis.balance_score) : 0;
              const scoreColor = getScoreColor(score);
              const statusConfig = getStatusConfig(analysis.analysis_status);
              const StatusIcon = statusConfig.icon;

              const foodNames = analysis.detected_foods?.map((f) => f.name).join(', ') || analysis.meal_type || 'Food Analysis';

              return (
                <div
                  key={analysis.id}
                  onClick={() => isCompleted ? setSelectedAnalysis(analysis) : undefined}
                  className={`
                    bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                    p-4 flex flex-col gap-4 transition-all duration-200 sm:flex-row sm:items-center
                    ${isCompleted ? 'cursor-pointer hover:border-green-300 dark:hover:border-green-700' : ''}
                    ${isProcessing ? 'opacity-80' : ''}
                    ${isFailed ? 'opacity-70 border-red-200 dark:border-red-800' : ''}
                  `}
                >
                  {/* Image Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={getImageUrl(analysis.image_url)}
                      alt="Food"
                      className="w-full h-full object-cover"
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {foodNames}
                      </h4>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                        {statusConfig.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(analysis.date_added)}
                      </span>
                      {analysis.meal_type && (
                        <span className="flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          {analysis.meal_type}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {parseFloat(analysis.total_calories).toFixed(0)} cal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score / Action */}
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:flex-shrink-0 sm:justify-start">
                    {isCompleted && (
                      <>
                        <div className={`px-3 py-1.5 rounded-lg ${scoreColor.bg}`}>
                          <span className={`text-sm font-bold ${scoreColor.text}`}>
                            {score.toFixed(0)}%
                          </span>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </>
                    )}
                    {isFailed && analysis.error_message && (
                      <span className="text-xs text-red-500 max-w-[120px] truncate" title={analysis.error_message}>
                        {analysis.error_message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[100px] text-center">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnalysisDetailModal
        analysis={selectedAnalysis}
        open={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
    </div>
  );
};

export default AnalysisHistory;
