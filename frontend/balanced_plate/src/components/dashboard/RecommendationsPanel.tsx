import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Salad,
  Pill,
  Clock,
  Target
} from 'lucide-react';

export interface Recommendation {
  id: string;
  type: 'warning' | 'success' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category?: 'nutrition' | 'vitamins' | 'timing' | 'general';
}

interface RecommendationsPanelProps {
  recommendations?: Recommendation[];
  isLoading?: boolean;
  className?: string;
}

// Mock recommendations - will be replaced with backend data later
export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Increase Iron Intake',
    description: 'Your iron levels are at 67% of daily requirements. Consider adding spinach, lentils, or lean red meat to your meals.',
    priority: 'high',
    category: 'vitamins'
  },
  {
    id: '2',
    type: 'tip',
    title: 'Add More Vegetables',
    description: 'Your vegetable intake is below recommended levels. Try adding a side salad to your lunch.',
    priority: 'medium',
    category: 'nutrition'
  },
  {
    id: '3',
    type: 'success',
    title: 'Great Protein Balance!',
    description: 'You\'ve consistently met your protein goals this week. Keep up the excellent work!',
    priority: 'low',
    category: 'nutrition'
  },
  {
    id: '4',
    type: 'tip',
    title: 'Consider Earlier Dinner',
    description: 'Your dinner timing has been late. Eating earlier may improve digestion and sleep quality.',
    priority: 'medium',
    category: 'timing'
  },
  {
    id: '5',
    type: 'warning',
    title: 'Vitamin D Deficiency',
    description: 'Your Vitamin D intake is only 75% of recommended daily value. Consider fortified foods or supplements.',
    priority: 'high',
    category: 'vitamins'
  }
];

const getIcon = (type: string, category?: string) => {
  if (category === 'vitamins') return <Pill className="w-5 h-5 text-purple-500" />;
  if (category === 'timing') return <Clock className="w-5 h-5 text-blue-500" />;
  if (category === 'nutrition') return <Salad className="w-5 h-5 text-green-500" />;
  
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    default:
      return <Lightbulb className="w-5 h-5 text-blue-500" />;
  }
};

const getPriorityStyles = (priority: string, type: string) => {
  if (type === 'success') {
    return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30';
  }
  
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30';
    case 'medium':
      return 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30';
    default:
      return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30';
  }
};

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  recommendations = mockRecommendations, 
  isLoading,
  className = ''
}) => {
  // Sort by priority: high > medium > low
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full ${className}`}>
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col ${className}`}>
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            Personalized Tips
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {sortedRecommendations.length} tips
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-[400px] lg:max-h-none">
        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium">Great job!</p>
            <p className="text-sm">No urgent recommendations at this time.</p>
          </div>
        ) : (
          sortedRecommendations.slice(0, 5).map((rec) => (
            <div
              key={rec.id}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${getPriorityStyles(rec.priority, rec.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(rec.type, rec.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {rec.title}
                    </h4>
                    {rec.priority === 'high' && (
                      <span className="flex-shrink-0 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">
                        HIGH
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {sortedRecommendations.length > 5 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
            View all {sortedRecommendations.length} recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;
