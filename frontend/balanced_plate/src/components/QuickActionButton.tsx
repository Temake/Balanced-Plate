import React from 'react';
import { Camera, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionButtonProps {
  className?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  const handleQuickAnalyze = () => {
    navigate('/analyze-food');
  };

  return (
    <div className={`${className}`}>
      <button
        onClick={handleQuickAnalyze}
        className="group relative overflow-hidden bg-gradient-to-r bg-green-500 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-600"
      >
        
        <div className="absolute inset-0 bg-gradient-to-r bg-green-400  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative flex items-center space-x-2">
          <div className="relative">
            <Camera className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
          </div>
          <span className="text-sm sm:text-base">Quick Analyze</span>
        </div>
        
        
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Instant food analysis
      </p>
    </div>
  );
};

export default QuickActionButton;
