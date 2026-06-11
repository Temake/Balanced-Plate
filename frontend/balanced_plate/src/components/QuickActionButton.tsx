import React from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionButtonProps {
  className?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/analyze-food')}
      className={`p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 ${className}`}
      title="Quick Analyze"
    >
      <Camera className="w-5 h-5" />
    </button>
  );
};

export default QuickActionButton;
