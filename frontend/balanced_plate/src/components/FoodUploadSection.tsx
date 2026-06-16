import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, Loader2, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Lightbulb, ArrowRightLeft, MessageCircle } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import type { FoodAnalysis, PaginatedResponse } from '@/api/types';
import {  normalizeScore } from '@/utils/imageUrl';
import { queryKeys } from '@/api/queryKeys';
import { useAuth } from '@/hooks/useAuth';

interface FoodUploadSectionProps {
  className?: string;
  onUploadComplete?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

// Timeout for analysis in case WebSocket notification is missed (30 seconds)
const ANALYSIS_TIMEOUT = 30000;

const FoodUploadSection: React.FC<FoodUploadSectionProps> = ({ className = '', onUploadComplete }) => {
  const { uploadFile } = useFiles();
  const { user } = useAuth();
  const { analysisCompleted, analysisFailed, clearAnalysisNotification } = useWebSocket();
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showNutritionDetails, setShowNutritionDetails] = useState(false);
  const [latestAnalysisId, setLatestAnalysisId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch the latest analysis after completion
  const { data: latestAnalysis } = useQuery({
    queryKey: queryKeys.foodAnalyses.list({ userId: user?.id, limit: 1 }),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<FoodAnalysis>>('/results/', {
        params: { limit: 1 },
      });
      return response.data.results?.[0] || null;
    },
    enabled: uploadStatus === 'complete' && !!latestAnalysisId && !!user?.id,
  });

  // Handle WebSocket notifications for analysis completion
  useEffect(() => {
    if (analysisCompleted && uploadStatus === 'analyzing') {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
      setUploadStatus('complete');
      setLatestAnalysisId(Date.now()); // trigger refetch
      toast.success('Food analysis complete!');
      queryClient.invalidateQueries({ queryKey: queryKeys.foodAnalyses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.healthReport.all });
      clearAnalysisNotification();
      onUploadComplete?.();
    } else if (analysisFailed && uploadStatus === 'analyzing') {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
      setUploadStatus('error');
      toast.error('Food analysis failed. Please try again.');
      clearAnalysisNotification();
      setTimeout(() => {
        setUploadStatus('idle');
        setPreviewImage(null);
      }, 3000);
    }
  }, [analysisCompleted, analysisFailed, uploadStatus, clearAnalysisNotification, queryClient, onUploadComplete]);

  // Cleanup camera stream and timeout on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [stream]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    setUploadStatus('uploading');
    setShowNutritionDetails(false);
    try {
      await uploadFile(file, 'food image');
      setUploadStatus('analyzing');
      toast.success('Image uploaded! Analyzing...');
      
      analysisTimeoutRef.current = setTimeout(() => {
        setUploadStatus((currentStatus) => {
          if (currentStatus === 'analyzing') {
            console.log('Analysis timeout - assuming complete');
            toast.success('Food analysis complete!');
            setLatestAnalysisId(Date.now());
            queryClient.invalidateQueries({ queryKey: queryKeys.foodAnalyses.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.nutrition.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.healthReport.all });
            onUploadComplete?.();
            return 'complete';
          }
          return currentStatus;
        });
      }, ANALYSIS_TIMEOUT);
    } catch (error) {
      setUploadStatus('error');
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
      setTimeout(() => {
        setUploadStatus('idle');
        setPreviewImage(null);
      }, 3000);
    }
  };

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        closeCamera();
        await handleFileSelect(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setPreviewImage(null);
    setLatestAnalysisId(null);
    setShowNutritionDetails(false);
  };

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'analyzing';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
        <Camera className="mr-2 sm:mr-3 text-emerald-600 dark:text-emerald-400" size={20} />
        Capture Your Meal
      </h2>
      
      {/* Camera View */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black/80">
            <h3 className="text-white font-semibold">Take a Photo</h3>
            <button
              onClick={closeCamera}
              className="text-white hover:text-gray-300 p-2"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="p-6 bg-black/80 flex justify-center">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-emerald-500 transition-all"
            />
          </div>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && previewImage && (
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={previewImage} 
              alt="Preview"
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-center">
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-3" />
                    <p className="text-white font-medium text-lg">Uploading image...</p>
                    <p className="text-white/70 text-sm mt-1">Please wait</p>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                    </div>
                    <p className="text-white font-medium text-lg">Analyzing your food...</p>
                    <p className="text-white/70 text-sm mt-1">AI is checking your meal</p>
                    <div className="flex justify-center gap-1 mt-4">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete State — Conversational Feedback */}
      {uploadStatus === 'complete' && previewImage && (
        <div className="mb-6 space-y-4">
          {/* Food image with name overlay */}
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={previewImage} 
              alt="Analyzed food"
              className="w-full h-40 sm:h-52 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-medium">Analysis Complete</span>
                </div>
                {latestAnalysis?.food_name && (
                  <h3 className="text-lg font-bold text-white">
                    {latestAnalysis.food_name}
                  </h3>
                )}
              </div>
              {latestAnalysis?.meal_type && (
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  {latestAnalysis.meal_type}
                </span>
              )}
            </div>
          </div>

          {/* Conversational Feedback Bubble */}
          {latestAnalysis?.conversational_feedback && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/40">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Balanced Plate AI
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {latestAnalysis.conversational_feedback}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Suggestion */}
          {latestAnalysis?.actionable_suggestion && (
            <div className="bg-amber-50 dark:bg-amber-900/15 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5 uppercase tracking-wide">
                    Quick Tip
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {latestAnalysis.actionable_suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Suggestion */}
          {latestAnalysis?.alternative_suggestion && (
            <div className="bg-blue-50 dark:bg-blue-900/15 rounded-xl p-3.5 border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5 uppercase tracking-wide">
                    Healthier Alternative
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {latestAnalysis.alternative_suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Nutrition Details */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowNutritionDetails(!showNutritionDetails)}
              className="w-full flex items-center justify-between p-3.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span>See Nutrition Details</span>
              {showNutritionDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showNutritionDetails && latestAnalysis && (
              <div className="px-3.5 pb-3.5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                {/* Macro grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Calories', value: `${parseFloat(latestAnalysis.total_calories).toFixed(0)}`, unit: 'kcal', color: 'text-orange-600 dark:text-orange-400' },
                    { label: 'Protein', value: `${parseFloat(latestAnalysis.total_protein).toFixed(0)}`, unit: 'g', color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Carbs', value: `${parseFloat(latestAnalysis.total_carbs).toFixed(0)}`, unit: 'g', color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Fat', value: `${parseFloat(latestAnalysis.total_fat).toFixed(0)}`, unit: 'g', color: 'text-rose-600 dark:text-rose-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                      <div className={`text-base font-bold ${stat.color}`}>
                        {stat.value}<span className="text-[10px] font-normal ml-0.5">{stat.unit}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Balance Score */}
                <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Balance Score</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {(normalizeScore(latestAnalysis.balance_score)).toFixed(0)}%
                  </span>
                </div>

                {/* Detected Foods */}
                {latestAnalysis.detected_foods && latestAnalysis.detected_foods.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Detected Foods</p>
                    <div className="space-y-1.5">
                      {latestAnalysis.detected_foods.map((food) => (
                        <div key={food.id} className="flex items-center justify-between py-1.5 px-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-xs">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{food.name}</span>
                          <span className="text-gray-500">{parseFloat(food.calories).toFixed(0)} cal</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scan Another */}
          <button
            onClick={resetUpload}
            className="w-full py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
          >
            Scan Another Meal
          </button>
        </div>
      )}

      {/* Error State */}
      {uploadStatus === 'error' && previewImage && (
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={previewImage} 
              alt="Preview"
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-red-500/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <X className="w-16 h-16 text-white mb-3" />
              <p className="text-white font-medium text-lg">Analysis Failed</p>
              <p className="text-white/90 text-sm mt-1">Please try again</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Options - Only show when not processing */}
      {!isCameraOpen && uploadStatus === 'idle' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={openCamera}
            className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <Camera className="text-emerald-500 dark:text-emerald-400 mb-3" size={28} />
            <span className="font-medium text-gray-700 dark:text-gray-200">Use Camera</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Take a photo</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <Image className="text-emerald-500 dark:text-emerald-400 mb-3" size={28} />
            <span className="font-medium text-gray-700 dark:text-gray-200">Upload Image</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">From gallery</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isProcessing}
      />
    </div>
  );
};

export default FoodUploadSection;
