import Header from "@/components/Header"
import React from "react";
import FoodUploadSection from "@/components/FoodUploadSection";
import RecentAnalysis from "@/components/RecentAnalysis";




const AnalyseFood: React.FC = () => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          
         
          <div className="lg:col-span-1 xl:col-span-2">
            <FoodUploadSection 
              className="mb-6"
            />
          </div>

          {/* Recent Analysis Section */}
          <div className="lg:col-span-1 xl:col-span-1">
            <RecentAnalysis />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyseFood;