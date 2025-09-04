import Header from "@/components/Header"
import React, { useState, useRef } from "react";
import { Camera, Image, Activity } from 'lucide-react';

// TypeScript interfaces
interface RecentMeal {
  id: number;
  name: string;
  time: string;
  calories: number;
  balanced: number;
}

interface AnalysisResult {
  foodName: string;
  calories: number;
  balanceScore: number;
  nutrients: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    vitamins: number;
  };
  healthScore: string;
}

const recentMeals: RecentMeal[] = [
  { id: 1, name: 'Grilled Chicken Salad', time: '2 hours ago', calories: 450, balanced: 85 },
  { id: 2, name: 'Pasta with Vegetables', time: '5 hours ago', calories: 520, balanced: 72 },
  { id: 3, name: 'Fruit Smoothie', time: '1 day ago', calories: 280, balanced: 68 }
];

const AnalyseFood: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCapturedImage(e.target.result as string);
          analyzeFood();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setCapturedImage(e.target.result as string);
          analyzeFood();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = (): void => {
    setIsAnalyzing(true);
    // Simulate API call for food analysis
    setTimeout(() => {
      setAnalysisResult({
        foodName: 'Grilled Salmon with Quinoa',
        calories: 485,
        balanceScore: 88,
        nutrients: {
          protein: 32,
          carbs: 28,
          fats: 18,
          fiber: 8,
          vitamins: 14
        },
        healthScore: 'Excellent'
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const clearImage = (): void => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow">
       

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">'
          
          {/* Food Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center">
                <Camera className="mr-2 sm:mr-3 text-blue-600 dark:text-blue-400" size={20} />
                Capture Your Meal
              </h2>
              
              {!capturedImage ? (
                <div className="space-y-4">
                  {/* Method Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        cameraInputRef.current?.click();
                      }}
                      className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <Camera className="text-blue-500 dark:text-blue-400 mb-3" size={28} />
                      <span className="font-medium text-gray-700 dark:text-gray-200">Use Camera</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Take a photo</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="flex flex-col items-center p-4 sm:p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-300"
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
                  />
                  
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCameraCapture}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Captured Image */}
                  <div className="relative">
                    <img 
                      src={capturedImage || ''} 
                      alt="Captured food"
                      className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  {/* Analysis Status */}
                  {isAnalyzing ? (
                    <div className="text-center p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">Analyzing your meal...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few seconds</p>
                    </div>
                  ) : analysisResult && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                      <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">{analysisResult.foodName}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                          <span className="font-medium ml-1 text-gray-900 dark:text-white">{analysisResult.calories}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Balance Score:</span>
                          <span className="font-medium ml-1 text-green-600 dark:text-green-400">{analysisResult.balanceScore}%</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-2 py-1 rounded">
                          {analysisResult.healthScore}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Meals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Activity className="mr-2 text-orange-500 dark:text-orange-400" size={20} />
                Recent Meals
              </h3>
              <div className="space-y-3">
                {recentMeals.map((meal: RecentMeal) => (
                  <div key={meal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">{meal.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{meal.calories} cal</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{meal.balanced}% balanced</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyseFood;