import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  Loader2,
  TrendingUp,
  Upload,
  Sparkles,
  Utensils,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import api from '@/api/axios';
import { useFiles } from '@/hooks/useFiles';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { FoodAnalysis, PaginatedResponse } from '@/api/types';
import { getImageUrl, normalizeScore } from '@/utils/imageUrl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FoodImageSkeleton } from '@/components/common/Skeletons';
import { toast } from 'sonner';

interface FoodGalleryProps {
  className?: string;
}

// Query key for food analyses
const analysesQueryKey = ['foodAnalyses'];

// Fetch paginated food analyses
const fetchAnalyses = async (page: number, pageSize: number = 8): Promise<PaginatedResponse<FoodAnalysis>> => {
  const response = await api.get('/results/', {
    params: { page, page_size: pageSize },
  });
  return response.data;
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

// Get balance score color (expects normalized 0-100 score)
const getScoreColor = (score: string | number): { bg: string; text: string; gradient: string } => {
  const numScore = normalizeScore(score);
  if (numScore >= 80) return { 
    bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-green-500'
  };
  if (numScore >= 60) return { 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-cyan-500'
  };
  if (numScore >= 40) return { 
    bg: 'bg-amber-100 dark:bg-amber-900/30', 
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-500'
  };
  return { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'text-red-600 dark:text-red-400',
    gradient: 'from-red-500 to-rose-500'
  };
};

// Analysis Result Modal
interface AnalysisModalProps {
  analysis: FoodAnalysis | null;
  open: boolean;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ analysis, open, onClose }) => {
  if (!analysis) return null;

  const scoreColor = getScoreColor(analysis.balance_score);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-green-600" />
            Food Analysis Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image and Score */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-48 h-48 rounded-xl overflow-hidden">
              <img
                src={getImageUrl(analysis.image_url)}
                alt="Food analysis"
                className="w-full h-full object-cover"
              />
              {analysis.meal_type && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                  {analysis.meal_type}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {/* Balance Score */}
              <div className={`p-4 rounded-xl ${scoreColor.bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance Score</span>
                  <div className={`text-3xl font-bold ${scoreColor.text}`}>
                    {normalizeScore(analysis.balance_score).toFixed(0)}%
                  </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${scoreColor.gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(normalizeScore(analysis.balance_score), 100)}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Flame className="w-4 h-4 text-orange-500 mb-1" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {parseFloat(analysis.total_calories).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">Calories</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-500 mb-1" />
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {parseFloat(analysis.total_protein).toFixed(0)}g
                  </div>
                  <div className="text-xs text-gray-500">Protein</div>
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

          {/* Recommendations */}
          {analysis.next_meal_recommendations && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Recommendations
              </h4>
              <div className="space-y-3">
                {analysis.next_meal_recommendations.nutritional_recommendations?.map((rec, idx) => (
                  <div key={`nutritional-${idx}`} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                  </div>
                ))}
                {analysis.next_meal_recommendations.balance_improvements?.map((rec, idx) => (
                  <div key={`balance-${idx}`} className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                  </div>
                ))}
                {analysis.next_meal_recommendations.timing_recommendations?.map((rec, idx) => (
                  <div key={`timing-${idx}`} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Time */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Analyzed {formatRelativeTime(analysis.date_added)}
            </span>
            {analysis.is_mock_data && (
              <span className="text-amber-500">Demo data</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Food Image Card
interface FoodImageCardProps {
  analysis: FoodAnalysis;
  onClick: () => void;
}

const FoodImageCard: React.FC<FoodImageCardProps> = ({ analysis, onClick }) => {
  const isProcessing = analysis.analysis_status === 'analysis_pending' || analysis.analysis_status === 'analysis_processing';
  const isFailed = analysis.analysis_status === 'analysis_failed';
  const scoreColor = getScoreColor(analysis.balance_score);

  return (
    <div 
      onClick={!isProcessing && !isFailed ? onClick : undefined}
      className={`
        relative aspect-square rounded-xl overflow-hidden cursor-pointer
        group transition-all duration-300
        ${!isProcessing && !isFailed ? 'hover:ring-2 hover:ring-green-500 hover:shadow-lg' : ''}
        ${isProcessing ? 'opacity-80' : ''}
        ${isFailed ? 'opacity-60' : ''}
      `}
    >
      {/* Image */}
      <img
        src={getImageUrl(analysis.image_url)}
        alt="Food"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
          <span className="text-white text-xs font-medium">Analyzing...</span>
        </div>
      )}

      {/* Failed Overlay */}
      {isFailed && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <span className="text-white text-xs font-medium">Analysis Failed</span>
        </div>
      )}

      {/* Score Badge (only when completed) */}
      {!isProcessing && !isFailed && (
        <>
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full ${scoreColor.bg} backdrop-blur-sm`}>
            <span className={`text-xs font-bold ${scoreColor.text}`}>
              {normalizeScore(analysis.balance_score).toFixed(0)}%
            </span>
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1 text-xs">
                <Flame className="w-3 h-3" />
                {parseFloat(analysis.total_calories).toFixed(0)} cal
              </div>
              <Eye className="w-4 h-4" />
            </div>
          </div>
        </>
      )}

      {/* Time Badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded-full text-[10px] text-white backdrop-blur-sm">
        {formatRelativeTime(analysis.date_added)}
      </div>
    </div>
  );
};

// Main Component
const FoodGallery: React.FC<FoodGalleryProps> = ({ className = '' }) => {
  const [page, setPage] = useState(1);
  const [selectedAnalysis, setSelectedAnalysis] = useState<FoodAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { uploadFile } = useFiles();
  const { analysisCompleted, analysisFailed, clearAnalysisNotification } = useWebSocket();

  // Fetch analyses with React Query
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [...analysesQueryKey, page],
    queryFn: () => fetchAnalyses(page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle WebSocket notifications - auto-open modal when analysis completes
  useEffect(() => {
    if (analysisCompleted) {
      const completedId = analysisCompleted.id;
      
      // Refetch to get updated analysis data
      refetch().then(({ data: refreshedData }) => {
        // Find the completed analysis in the refreshed data
        const completedAnalysis = refreshedData?.results?.find(
          (a: FoodAnalysis) => a.id === completedId && a.analysis_status === 'analysis_completed'
        );
        
        if (completedAnalysis) {
          // Auto-open the modal with the completed analysis
          setSelectedAnalysis(completedAnalysis);
          toast.success('Food analysis complete! View your results.', {
            duration: 4000,
          });
        }
      });
      
      clearAnalysisNotification();
    } else if (analysisFailed) {
      toast.error('Food analysis failed. Please try again.');
      queryClient.invalidateQueries({ queryKey: analysesQueryKey });
      clearAnalysisNotification();
    }
  }, [analysisCompleted, analysisFailed, queryClient, clearAnalysisNotification, refetch]);

  // Handle file upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadFile(file, 'food image');
      // Refetch to show new image (analysis will be processing)
      queryClient.invalidateQueries({ queryKey: analysesQueryKey });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const totalPages = data ? Math.ceil(data.count / 8) : 1;
  const hasNext = !!data?.next;
  const hasPrev = !!data?.previous;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Food Gallery</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {data?.count || 0} meals analyzed
              </p>
            </div>
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isUploading}
              asChild
            >
              <span>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <FoodImageSkeleton key={i} />
            ))}
          </div>
        ) : data?.results && data.results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.results.map((analysis) => (
              <FoodImageCard
                key={analysis.id}
                analysis={analysis}
                onClick={() => setSelectedAnalysis(analysis)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No food images yet. Upload your first meal!
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button variant="default" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Food Image
              </Button>
            </label>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => p - 1)}
              disabled={!hasPrev || isFetching}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
              Page {page} of {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext || isFetching}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        analysis={selectedAnalysis}
        open={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
      />
    </div>
  );
};

export default FoodGallery;
