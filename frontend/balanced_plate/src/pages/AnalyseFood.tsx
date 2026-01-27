import Header from "@/components/Header"
import React from "react";
import FoodUploadSection from "@/components/FoodUploadSection";
import RecentAnalysis from "@/components/RecentAnalysis";
import { FoodGallery } from "@/components/dashboard";
import { ErrorBoundary, SectionErrorFallback } from "@/components/common/ErrorBoundary";
import { Camera, History, Images, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router";

const AnalyseFood: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                Analyse Food
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Upload or capture food images for instant AI-powered nutritional analysis
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instant Results</span>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Capture & Upload</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Take a photo or upload from gallery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Get Nutrition Data</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Calories, macros & balance score</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100 dark:border-purple-800/50">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Track Progress</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">View history & trends over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Upload Section - Takes 2 columns on XL */}
          <div className="xl:col-span-2 space-y-6">
            <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load upload section" />}>
              <FoodUploadSection />
            </ErrorBoundary>
            
            {/* Food Gallery - Below Upload Section */}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Images className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Food Gallery</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your analyzed food images with results</p>
                </div>
              </div>
              <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load food gallery" />}>
                <FoodGallery />
              </ErrorBoundary>
            </div>
          </div>

          {/* Recent Analysis Section - Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-4">
              <ErrorBoundary fallback={<SectionErrorFallback title="Unable to load recent analysis" />}>
                <RecentAnalysis 
                  limit={6}
                  onViewAll={() => navigate('/history')}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyseFood;