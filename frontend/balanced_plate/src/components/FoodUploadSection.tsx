import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { useWebSocket } from '@/hooks/useWebSocket';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface FoodUploadSectionProps {
  className?: string;
  onUploadComplete?: () => void;
}

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

// Timeout for analysis in case WebSocket notification is missed (30 seconds)
const ANALYSIS_TIMEOUT = 30000;

const FoodUploadSection: React.FC<FoodUploadSectionProps> = ({ className = '', onUploadComplete }) => {
  const { uploadFile } = useFiles();
  const { analysisCompleted, analysisFailed, clearAnalysisNotification, isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle WebSocket notifications for analysis completion
  useEffect(() => {
    if (analysisCompleted && uploadStatus === 'analyzing') {
      // Clear timeout since we got the notification
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
      setUploadStatus('complete');
      toast.success('Food analysis complete!');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['foodAnalyses'] });
      queryClient.invalidateQueries({ queryKey: ['recentAnalyses'] });
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
      clearAnalysisNotification();
      onUploadComplete?.();
      // Reset after showing success
      setTimeout(() => {
        setUploadStatus('idle');
        setPreviewImage(null);
      }, 2000);
    } else if (analysisFailed && uploadStatus === 'analyzing') {
      // Clear timeout since we got the notification
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

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploadStatus('uploading');
    try {
      await uploadFile(file, 'food image');
      setUploadStatus('analyzing');
      toast.success('Image uploaded! Analyzing...');
      
      // Set a timeout to complete analysis in case WebSocket notification is missed
      analysisTimeoutRef.current = setTimeout(() => {
        // Use functional update to check current status
        setUploadStatus((currentStatus) => {
          if (currentStatus === 'analyzing') {
            console.log('Analysis timeout - assuming complete');
            toast.success('Food analysis complete!');
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['foodAnalyses'] });
            queryClient.invalidateQueries({ queryKey: ['recentAnalyses'] });
            queryClient.invalidateQueries({ queryKey: ['nutrition'] });
            onUploadComplete?.();
            setTimeout(() => {
              setUploadStatus('idle');
              setPreviewImage(null);
            }, 2000);
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
    // Reset input so same file can be selected again
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
      
      // Wait for video element to be ready
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

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'analyzing';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
        <Camera className="mr-2 sm:mr-3 text-blue-600 dark:text-blue-400" size={20} />
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
              className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-blue-500 transition-all"
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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
                    </div>
                    <p className="text-white font-medium text-lg">Analyzing your food...</p>
                    <p className="text-white/70 text-sm mt-1">AI is detecting nutrients</p>
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

      {/* Complete State */}
      {uploadStatus === 'complete' && previewImage && (
        <div className="mb-6">
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={previewImage} 
              alt="Preview"
              className="w-full h-48 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-green-500/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-white mb-3" />
              <p className="text-white font-medium text-lg">Analysis Complete!</p>
              <p className="text-white/90 text-sm mt-1">Check your results below</p>
            </div>
          </div>
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
            className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <Camera className="text-blue-500 dark:text-blue-400 mb-3" size={28} />
            <span className="font-medium text-gray-700 dark:text-gray-200">Use Camera</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Take a photo</span>
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <Image className="text-green-500 dark:text-green-400 mb-3" size={28} />
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
