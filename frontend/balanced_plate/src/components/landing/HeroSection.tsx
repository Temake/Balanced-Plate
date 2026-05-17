import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Camera, 
  Sparkles, 
  ArrowRight, 
  ChevronDown,
  Leaf,
  Brain,
  TrendingUp,
  Target
} from 'lucide-react';

const HeroSection: React.FC = () => {
  const floatingIcons = [
    { icon: Leaf, color: 'from-green-400 to-emerald-500', position: 'top-24 left-8 xl:left-16', delay: '0s' },
    { icon: Brain, color: 'from-purple-400 to-indigo-500', position: 'top-44 right-8 xl:right-16', delay: '0.5s' },
    { icon: TrendingUp, color: 'from-blue-400 to-cyan-500', position: 'bottom-36 left-10 xl:left-24', delay: '1s' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-green-300/25 blur-3xl animate-pulse lg:h-96 lg:w-96" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-pulse lg:h-96 lg:w-96" style={{ animationDelay: '1s' }} />
      
      {/* Floating Icons */}
      {floatingIcons.map((item, idx) => (
        <div
          key={idx}
          className={`absolute ${item.position} hidden lg:block animate-float`}
          style={{ animationDelay: item.delay }}
        >
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg opacity-80`}>
            <item.icon className="w-7 h-7 text-white" />
          </div>
        </div>
      ))}

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
                  className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
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
                    className="h-10 w-10 border-2 border-white bg-white shadow-sm dark:border-gray-900 dark:bg-gray-900"
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
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl shadow-gray-900/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-[2.5rem] overflow-hidden aspect-[9/19]">
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
                    <div className="relative bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl aspect-square mb-4 flex items-center justify-center overflow-hidden text-transparent">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-28 w-28 rounded-full bg-white shadow-inner dark:bg-gray-100">
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
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
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
                          <div key={item.label} className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center shadow-sm">
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

              {/* Floating Cards */}
              <div className="absolute -left-8 top-1/4 hidden max-w-[13rem] animate-float rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none xl:-left-16 xl:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center text-transparent [&_span]:hidden">
                    <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-xl">🥗</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Great Choice!</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">+15 Balance Points</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-1/3 hidden max-w-[12rem] animate-float rounded-2xl border border-gray-100 bg-white p-4 shadow-xl shadow-gray-200/50 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none xl:-right-12 xl:block" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">AI Tip</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Add more greens</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 animate-bounce xl:flex">
          <span className="text-sm text-gray-500 dark:text-gray-400">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
