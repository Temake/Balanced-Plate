import React from 'react';
import { Camera, Brain, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Snap a Photo',
    description: 'Take a quick photo of your meal using your phone camera. Our app works with any food - home-cooked or restaurant.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Analysis',
    description: 'Our advanced AI instantly identifies all food items, calculates portions, and analyzes nutritional content in seconds.',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Get Insights',
    description: 'Receive detailed nutrition breakdown, personalized recommendations, and track your progress towards your goals.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Start tracking your nutrition in three simple steps. 
            No complicated setup, no manual data entry required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 -translate-y-1/2" style={{ top: '120px' }} />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Card */}
                <div className={`relative bg-gradient-to-br ${step.bgColor} rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-gray-700 group hover:shadow-xl transition-all duration-300`}>
                  {/* Step Number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-28 -right-6 w-12 h-12 items-center justify-center z-10">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Arrow - Mobile */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700 rotate-90">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Demo Video Placeholder */}
        <div className="mt-16 lg:mt-24 relative">
          <div className="relative aspect-video max-w-4xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
            {/* Video Thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/20 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/80 text-lg">Watch How It Works</p>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
