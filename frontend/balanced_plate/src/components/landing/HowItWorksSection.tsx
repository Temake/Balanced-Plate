import React from 'react';
import { Camera, MessageCircle, CalendarDays, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Scan Your Meal',
    description: 'Take a quick photo of your food. NutriLens identifies the meal and starts your daily accountability record.',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'from-emerald-50/70 to-green-50/50 dark:from-emerald-950/30 dark:to-green-900/20',
  },
  {
    number: '02',
    icon: MessageCircle,
    title: 'Get a Useful Nudge',
    description: 'Receive short, conversational feedback based on your goal, diet preference, and health conditions.',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'from-emerald-50/70 to-green-50/50 dark:from-emerald-950/30 dark:to-green-900/20',
  },
  {
    number: '03',
    icon: CalendarDays,
    title: 'Plan, Cook, and Share',
    description: 'Build weekly meal plans, generate cooking steps for any dish, and download weekly food summaries from your profile.',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'from-emerald-50/70 to-green-50/50 dark:from-emerald-950/30 dark:to-green-900/20',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50/50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Build healthier food habits without turning every meal into homework.
            Scan, act on one practical tip, and keep your weekly pattern visible.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-300 dark:from-emerald-800 dark:via-green-700 dark:to-emerald-800 -translate-y-1/2" style={{ top: '120px' }} />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Card */}
                <div className={`relative bg-gradient-to-br ${step.bgColor} rounded-3xl p-8 lg:p-10 border border-gray-100 dark:border-gray-700 group transition-all duration-300`}>
                  {/* Step Number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
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
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Arrow - Mobile */}
                {idx < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 rotate-90">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
