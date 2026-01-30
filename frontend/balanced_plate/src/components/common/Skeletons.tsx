import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
);

// Card skeleton for dashboard sections
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-24 w-full" />
  </div>
);

// Analytics chart skeleton
export const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="mt-4">
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  </div>
);

// Recommendation card skeleton
export const RecommendationSkeleton: React.FC = () => (
  <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

// Recommendations panel skeleton
export const RecommendationsPanelSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-8 w-16 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-16 rounded-full" />
    </div>
    <div className="space-y-3">
      <RecommendationSkeleton />
      <RecommendationSkeleton />
      <RecommendationSkeleton />
    </div>
  </div>
);

// Food image card skeleton
export const FoodImageSkeleton: React.FC = () => (
  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
    <Skeleton className="w-full h-full" />
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

// Food upload section skeleton
export const FoodUploadSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <FoodImageSkeleton />
      <FoodImageSkeleton />
      <FoodImageSkeleton />
      <FoodImageSkeleton />
    </div>
    <div className="flex justify-center mt-4">
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  </div>
);

// Weekly score skeleton
export const WeeklyScoreSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white', className)}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-32 bg-white/20" />
      <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
    </div>
    <div className="flex items-end gap-4 mb-4">
      <Skeleton className="h-16 w-24 bg-white/20 rounded" />
      <Skeleton className="h-8 w-16 bg-white/20 rounded" />
    </div>
    <Skeleton className="h-2 w-full rounded-full bg-white/20" />
    <div className="grid grid-cols-2 gap-4 mt-6">
      <Skeleton className="h-16 bg-white/10 rounded-lg" />
      <Skeleton className="h-16 bg-white/10 rounded-lg" />
    </div>
  </div>
);

// Recent analysis skeleton
export const RecentAnalysisSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6', className)}>
    <Skeleton className="h-6 w-40 mb-6" />
    <div className="flex gap-4">
      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-8 rounded" />
          <Skeleton className="h-8 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// Dashboard page skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="p-4 md:p-6 lg:p-8 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <ChartSkeleton />
        <FoodUploadSkeleton />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <WeeklyScoreSkeleton />
        <RecommendationsPanelSkeleton />
        <RecentAnalysisSkeleton />
      </div>
    </div>
  </div>
);

export default Skeleton;
