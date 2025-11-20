import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { toast } from 'sonner';

const getImageUrl = (filePath: string): string => {
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const baseURL = import.meta.env.VITE_API || '';
  console.log(filePath + "He")
  return `${baseURL}${filePath.startsWith('/') ? filePath : '/' + filePath}`;
};

interface FoodUploadSectionProps {
  className?: string;
}

const FoodUploadSection: React.FC<FoodUploadSectionProps> = ({ className = '' }) => {
  const { files, isLoading, error, uploadFile, fetchFiles } = useFiles();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
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
    setIsUploading(true);
    try {
      await uploadFile(file, 'food image');
      toast.success('Image uploaded successfully!');
      setPreviewImage(null);
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
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

      {/* Upload Options */}
      {!isCameraOpen && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={openCamera}
              disabled={isUploading}
              className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="text-blue-500 dark:text-blue-400 mb-3" size={28} />
              <span className="font-medium text-gray-700 dark:text-gray-200">Use Camera</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Take a photo</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image className="text-green-500 dark:text-green-400 mb-3" size={28} />
              <span className="font-medium text-gray-700 dark:text-gray-200">Upload Image</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">From gallery</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}

      {/* Preview during upload */}
      {previewImage && isUploading && (
        <div className="mb-6">
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Preview"
              className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-white font-medium">Uploading...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !isUploading && (
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your images...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && files.length === 0 && !previewImage && (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Image className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No images yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload your first food image using the buttons above
          </p>
        </div>
      )}

      {/* Image Gallery */}
      {!isLoading && files.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Your Food Images ({files.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                <img
                  src={getImageUrl(file.file)}
                  alt={file.original_name || 'Food image'}
                  className="w-full h-32 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Failed to load image:', file.file);
                    target.style.backgroundColor = '#f3f4f6';
                    target.alt = 'Failed to load image';
                  }}
                />
                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-opacity rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                    {file.original_name || 'Food image'}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    {new Date(file.date_added).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodUploadSection;
