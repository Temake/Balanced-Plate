import React from 'react';
import { Calendar } from 'lucide-react';

export type DateRange = 'today' | 'week' | 'month' | 'all';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
}

const options: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ 
  value, 
  onChange,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 ml-2" />
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
              value === option.value
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.value === 'all' ? 'All' : option.label.split(' ')[1] || option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangeFilter;
