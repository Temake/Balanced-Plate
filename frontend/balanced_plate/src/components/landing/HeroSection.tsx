import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  MessageCircle,
  CalendarCheck
} from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)] lg:gap-12 xl:gap-20">
          {/* Left Content */}
          <div className="text-center lg:text-left">
          

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">Transform Your</span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Daily Food Choices
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">With AI</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Snap your meal, get friendly Nigerian-style feedback, plan your week, cook with AI,
              and keep downloadable summaries of your eating patterns.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/signup">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 hover:scale-105"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Tracking Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

          </div>

          {/* Right Content - App Preview */}
          <div className="relative">
            {/* Main Phone Mockup */}
            <div className="relative mx-auto w-72 sm:w-80 lg:w-88 xl:w-96">
              {/* Phone Frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-3">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                  {/* App Screen Content */}
                  <div className="p-4 h-full flex flex-col">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-current rounded-sm">
                          <div className="w-3/4 h-full bg-green-500 rounded-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Food Image */}
                    <div className="relative bg-gray-100 dark:bg-gray-700 rounded-2xl aspect-square mb-4 flex items-center justify-center overflow-hidden text-transparent">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-28 w-28 rounded-full bg-white dark:bg-gray-100">
                          <div className="absolute left-5 top-5 h-10 w-10 rounded-full bg-emerald-400" />
                          <div className="absolute right-5 top-6 h-9 w-9 rounded-full bg-orange-400" />
                          <div className="absolute bottom-5 left-8 h-9 w-16 rounded-full bg-amber-300" />
                          <div className="absolute inset-3 rounded-full border border-gray-200" />
                        </div>
                      </div>
                      <div className="text-6xl">🍱</div>
                      <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Analyzing...
                      </div>
                    </div>

                    {/* Accountability Feedback */}
                    <div className="space-y-2 flex-1">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Jollof rice with chicken</span>
                            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
                              Good plate. Add more vegetables and keep the rice portion moderate today.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Today', value: '2 meals', color: 'from-emerald-400 to-emerald-500' },
                          { label: 'Week', value: '4/7 days', color: 'from-amber-400 to-orange-500' },
                        ].map((item) => (
                          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center">
                            <div className={`text-xs font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                              {item.value}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-3 text-white mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-transparent [&_span]:hidden">
                            <CalendarCheck className="h-5 w-5 text-white" />
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <div className="text-xs opacity-80">Next step</div>
                            <div className="text-sm font-bold">Plan dinner lighter</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
