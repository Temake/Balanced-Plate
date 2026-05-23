import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Target
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
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
              <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                AI-Powered Nutrition Analysis
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">Transform Your</span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Eating Habits
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">With AI</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Simply snap a photo of your meal and get instant nutritional insights, 
              personalized recommendations, and track your journey to a healthier lifestyle.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/signup">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-all duration-300 hover:scale-105"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Analyzing Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {/*
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Play className="w-5 h-5 mr-2 text-green-600" />
                Watch Demo
              </Button>
              */}
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <div className="flex -space-x-3">
                {[
                  { name: 'Ava', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
                  { name: 'Noah', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
                  { name: 'Mia', image: 'https://randomuser.me/api/portraits/women/68.jpg' },
                  { name: 'Liam', image: 'https://randomuser.me/api/portraits/men/75.jpg' },
                  { name: 'Zoe', image: 'https://randomuser.me/api/portraits/women/12.jpg' },
                ].map((user) => (
                  <Avatar
                    key={user.name}
                    className="h-10 w-10 border-2 border-white bg-white dark:border-gray-900 dark:bg-gray-900"
                  >
                    <AvatarImage src={user.image} alt={user.name} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-semibold text-white">
                      {user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span> from 10,000+ users
                </p>
              </div>
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

                    {/* Nutrition Stats */}
                    <div className="space-y-2 flex-1">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calories</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">485 kcal</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Protein', value: '32g', color: 'from-blue-400 to-blue-500' },
                          { label: 'Carbs', value: '45g', color: 'from-amber-400 to-orange-500' },
                          { label: 'Fat', value: '18g', color: 'from-pink-400 to-rose-500' },
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
                            <Target className="h-5 w-5 text-white" />
                            <span className="text-lg">🎯</span>
                          </div>
                          <div>
                            <div className="text-xs opacity-80">Balance Score</div>
                            <div className="text-lg font-bold">87%</div>
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
