import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, ArrowRight } from 'lucide-react';

// Real screenshots of the product, rotated inside the phone mockup. What used to sit
// here was a hand-built screen that exists nowhere in the app, so it promised a UI new
// users would never actually see.
const APP_SCREENS = [
  { src: '/food1.jpg', alt: 'NutriLens welcome screen starting profile setup' },
  { src: '/food2.jpg', alt: 'Choosing dietary preferences during onboarding' },
  { src: '/food3.jpg', alt: 'Choosing a health goal during onboarding' },
  { src: '/food4.jpg', alt: 'NutriLens dashboard with the daily scan prompt and weekly streak' },
  { src: '/food5.jpg', alt: 'AI feedback on a scanned plate of egusi soup with eba' },
];

const SCREEN_INTERVAL_MS = 4000;

const HeroSection: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveScreen((current) => (current + 1) % APP_SCREENS.length),
      SCREEN_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

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
                {/* App Screen — the screenshots are roughly 1:2, so the frame matches that
                    and `object-cover` only ever trims a sliver of side margin. */}
                <div className="relative bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden aspect-[1/2]">
                  {APP_SCREENS.map((screen, index) => (
                    <img
                      key={screen.src}
                      src={screen.src}
                      alt={screen.alt}
                      // Every screen stays mounted so the browser has already fetched the
                      // next one by the time it is faded in.
                      loading={index === 0 ? 'eager' : 'lazy'}
                      aria-hidden={index !== activeScreen}
                      className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ease-in-out ${
                        index === activeScreen ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
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
