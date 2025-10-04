import Header from "@/components/Header"
import React from "react";
import NutritionAnalytics from "@/components/NutritionAnalytics";
import MicronutrientChart from "@/components/MicronutrientChart";
import MealTimingChart from "@/components/MealTimingChart";
import QuickActionButton from "@/components/QuickActionButton";
import { useAuth } from "@/hooks/useAuth";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  console.log("Authenticated user:", user?.dob);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
   
        <div className="mb-6 flex justify-center lg:justify-end">
          <QuickActionButton />
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
 
          <NutritionAnalytics className="xl:col-span-1" />
 
          <MicronutrientChart className="xl:col-span-1" />
        </div>

        <div className="mb-8">
          <MealTimingChart />
        </div>
      </div>
    </div>
  )
}

export default Dashboard