import React from 'react';
import { 
  Camera, 
  Brain, 
  TrendingUp, 
  Utensils, 
  Target, 
  Bell,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: Camera,
    title: 'Instant Food Recognition',
    description: 'Simply snap a photo of your meal and our AI instantly identifies all food items with remarkable accuracy.',
    gradient: 'from-blue-500 to-cyan-500',
    iconColor: 'text-blue-500'
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze nutritional content, portion sizes, and meal balance in seconds.',
    gradient: 'from-purple-500 to-indigo-500',
    iconColor: 'text-purple-500'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Track your nutrition journey with beautiful charts and insights. See your improvements over time.',
    gradient: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500'
  },
  {
    icon: Target,
    title: 'Personalized Goals',
    description: 'Set custom nutrition goals based on your lifestyle, dietary preferences, and health objectives.',
    gradient: 'from-orange-500 to-amber-500',
    iconColor: 'text-orange-500'
  },
  {
    icon: Utensils,
    title: 'Meal Recommendations',
    description: 'Get personalized meal suggestions and recipes to help you achieve a more balanced diet.',
    gradient: 'from-pink-500 to-rose-500',
    iconColor: 'text-pink-500'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a meal with intelligent reminders that adapt to your eating schedule and habits.',
    gradient: 'from-teal-500 to-cyan-500',
    iconColor: 'text-teal-500'
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Powerful Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Better Nutrition
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our comprehensive suite of features makes tracking and improving your nutrition 
            effortless and enjoyable.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Hover Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-2 text-green-600 dark:text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">Learn more</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, value: '< 3s', label: 'Analysis Time' },
            { icon: Shield, value: '99.9%', label: 'Uptime' },
            { icon: Camera, value: '500+', label: 'Foods Recognized' },
            { icon: Brain, value: '95%', label: 'AI Accuracy' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/50">
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-green-600 dark:text-green-400" />
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
