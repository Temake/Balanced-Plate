import React, { useEffect, useRef, useState } from 'react';
import { 
  Camera, 
  ChefHat, 
  CalendarDays, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  HeartPulse, 
  ArrowRight,
  Flame,
  Clock,
  Apple,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  actionText: string;
  actionPath: string;
  mockupType: 'scan' | 'plan' | 'cook' | 'report' | 'analytics';
}

const featureList: FeatureItem[] = [
  {
    id: 'food-scan',
    badge: 'Food Scan',
    title: 'Instant Meal Analysis & Balance Score',
    description: 'Snap a photo of your food to identify dishes, estimate key nutrients, and receive a simple 0–100 balance score with next steps.',
    actionText: 'Try Food Scan',
    actionPath: '/analyze-food',
    mockupType: 'scan',
  },
  {
    id: 'meal-planning',
    badge: 'Meal Planner',
    title: 'Daily & Weekly Meal Planning',
    description: 'Create custom daily meal schedules or generate an automated 7-day plan aligned with your calorie and nutrition targets.',
    actionText: 'Explore Planner',
    actionPath: '/meal-plan',
    mockupType: 'plan',
  },
  {
    id: 'cooking-assistant',
    badge: 'Cooking Assistant',
    title: 'Step-by-Step Cooking Guide',
    description: 'Follow guided cultural and healthy recipes with exact ingredient measurements and interactive cooking timers.',
    actionText: 'Start Cooking',
    actionPath: '/recipes',
    mockupType: 'cook',
  },
  {
    id: 'health-insights',
    badge: 'Health Insights',
    title: 'Personalized Health Reports',
    description: 'Receive weekly summaries and actionable insights personalized for your health profile and dietary preferences.',
    actionText: 'View Reports',
    actionPath: '/profile',
    mockupType: 'report',
  },
  {
    id: 'nutrition-analytics',
    badge: 'Analytics',
    title: 'Habit & Intake Analytics',
    description: 'Monitor daily calorie timing, view food group breakdowns, and stay accountable with logging streaks.',
    actionText: 'Open Dashboard',
    actionPath: '/dashboard',
    mockupType: 'analytics',
  },
];

// Single animated feature row component with scroll trigger
const FeatureRow: React.FC<{ feature: FeatureItem; index: number }> = ({ feature, index }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isEven = index % 2 === 1;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (rowRef.current) {
      observer.observe(rowRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rowRef}
      className={`py-12 sm:py-16 lg:py-20 transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
    >
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
        isEven ? 'lg:flex-row-reverse' : ''
      }`}>
        {/* Content Column */}
        <div className={`lg:col-span-6 space-y-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              {feature.badge}
            </span>
          </div>

          {/* Heading */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
            {feature.title}
          </h3>

          {/* Short Description */}
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
            {feature.description}
          </p>

          {/* Action CTA */}
          <div className="pt-2">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow group font-medium px-5">
              <Link to={feature.actionPath} className="flex items-center gap-2">
                <span>{feature.actionText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Visual Mockup Column */}
        <div className={`lg:col-span-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="relative rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-gray-50 dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8 border border-emerald-100/80 dark:border-emerald-900/30 shadow-xl shadow-emerald-500/5 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700">
            {/* Ambient emerald background glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mockup renderer */}
            <FeatureMockup type={feature.mockupType} />
          </div>
        </div>
      </div>
    </div>
  );
};

// UI Mockup renderer simulating actual NutriLens features
const FeatureMockup: React.FC<{ type: FeatureItem['mockupType'] }> = ({ type }) => {
  switch (type) {
    case 'scan':
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Meal Analysis Result</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Jollof Rice & Grilled Fish</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">Balance Score</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">88/100</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">540 kcal</p>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">38g</p>
            </div>
            <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">Carbs / Fat</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">62g / 14g</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-3 border border-gray-100 dark:border-gray-700/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Next Step Advice</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              "Great protein balance from the grilled fish. To optimize this meal, add a side of steamed spinach or coleslaw to boost dietary fiber."
            </p>
          </div>
        </div>
      );

    case 'plan':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CalendarDays className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Weekly Schedule • Day 3</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Target: 2,100 kcal
            </span>
          </div>

          <div className="space-y-2">
            {[
              { meal: 'Breakfast', name: 'Oatmeal with Almonds & Banana', cal: '420 kcal', p: '16g protein' },
              { meal: 'Lunch', name: 'Grilled Chicken Salad with Plantain', cal: '650 kcal', p: '48g protein' },
              { meal: 'Dinner', name: 'Vegetable Efo Riro with Lean Beef', cal: '580 kcal', p: '42g protein' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    {item.meal}
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white block">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{item.cal}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{item.p}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cook':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ChefHat className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Active Guide</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white block">Low-Oil Spinach Egusi</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <Clock className="h-3.5 w-3.5" />
              <span>Step 2 of 4 • 15m</span>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Step 2: Simmer and Season</span>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              "Add the ground melon seed paste to your simmering pepper broth in small lumps. Allow to simmer on medium-low heat for 12 minutes without stirring."
            </p>
            <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
              <span>⏱️ Active timer: 08:45 remaining</span>
              <span className="font-semibold cursor-pointer underline">Next Step &rarr;</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>🥗 4 Servings • 480 kcal/serving</span>
            <span>🥩 36g Protein</span>
          </div>
        </div>
      );

    case 'report':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Health Summary • Week 34</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Hypertension Aware
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Sodium Intake</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Optimal (1,850mg/day)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Apple className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Fiber Target</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">94% of Weekly Goal</span>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/80 p-2.5 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Download Weekly PDF Report</span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Export</span>
          </div>
        </div>
      );

    case 'analytics':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Habit & Intake Analytics</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>14-Day Streak</span>
            </div>
          </div>

          {/* Mini calorie distribution bars */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span>Hourly Calorie Distribution</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Avg 2,150 kcal/day</span>
            </div>
            <div className="grid grid-cols-6 gap-1 h-14 items-end bg-gray-50 dark:bg-gray-800/80 p-2 rounded-xl border border-gray-100 dark:border-gray-700/60">
              {[
                { label: '08:00', h: 'h-6', val: '380' },
                { label: '11:00', h: 'h-3', val: '150' },
                { label: '13:00', h: 'h-10', val: '720' },
                { label: '16:00', h: 'h-4', val: '220' },
                { label: '19:00', h: 'h-9', val: '640' },
                { label: '21:00', h: 'h-2', val: '80' },
              ].map((bar, bIdx) => (
                <div key={bIdx} className="flex flex-col items-center gap-1">
                  <div className={`w-full bg-emerald-500 dark:bg-emerald-400 rounded-t-sm ${bar.h} transition-all`} />
                  <span className="text-[8px] text-gray-400">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Food groups pills */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200/50">
              <span className="text-gray-500 block">Veggie</span>
              <span className="font-bold text-emerald-600">35%</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200/50">
              <span className="text-gray-500 block">Protein</span>
              <span className="font-bold text-emerald-600">30%</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200/50">
              <span className="text-gray-500 block">Carbs</span>
              <span className="font-bold text-emerald-600">25%</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200/50">
              <span className="text-gray-500 block">Dairy</span>
              <span className="font-bold text-emerald-600">10%</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-20 lg:py-32 overflow-hidden bg-white dark:bg-gray-900">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
         
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
            Everything You Need for
            <span className="block bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 bg-clip-text text-transparent">
              Effortless, Balanced Living
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            NutriLens combines intelligent food vision, cultural meal awareness, and proactive habits into a single, intuitive platform.
          </p>
        </div>

        {/* Section by Section Features with Scroll Animations */}
        <div className="divide-y divide-gray-100/80 dark:divide-gray-800/80">
          {featureList.map((feature, idx) => (
            <FeatureRow key={feature.id} feature={feature} index={idx} />
          ))}
        </div>

        {/* Bottom Feature Metrics */}
        <div className="mt-20 lg:mt-28 grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[
            { icon: Camera, value: 'Vision AI', label: 'Instant food recognition & scores' },
            { icon: CalendarDays, value: '7-Day AI', label: 'Complete automated meal schedules' },
            { icon: ChefHat, value: 'AI Chef', label: 'Guided recipes with smart timers' },
            { icon: HeartPulse, value: 'Health AI', label: 'Condition-aware insights & reports' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
