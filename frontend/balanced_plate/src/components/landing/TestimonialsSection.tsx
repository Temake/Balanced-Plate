import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  highlight: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fitness Enthusiast',
    avatar: '👩‍💼',
    rating: 5,
    quote: 'Balanced Plate has completely transformed how I approach my meals. The AI analysis is incredibly accurate, and the recommendations have helped me achieve my fitness goals faster than ever!',
    highlight: 'Lost 15 lbs in 3 months'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Busy Professional',
    avatar: '👨‍💻',
    rating: 5,
    quote: 'As someone with a hectic schedule, I never had time to track calories manually. This app makes it effortless - just snap a photo and you\'re done. Game changer!',
    highlight: 'Saves 30 mins daily'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Nutritionist',
    avatar: '👩‍⚕️',
    rating: 5,
    quote: 'I recommend Balanced Plate to all my clients. The nutritional analysis is on par with professional tools, and the user interface makes it accessible to everyone.',
    highlight: 'Professional grade accuracy'
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Marathon Runner',
    avatar: '🏃‍♂️',
    rating: 5,
    quote: 'The meal timing insights have helped me optimize my nutrition for training. I\'ve seen significant improvements in my recovery and performance since using this app.',
    highlight: 'PR improved by 12 minutes'
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Mother of Three',
    avatar: '👩‍👧‍👦',
    rating: 5,
    quote: 'Finally an app that helps me ensure my family is eating balanced meals! The food recognition even works with home-cooked meals. Absolutely love it!',
    highlight: 'Whole family eating healthier'
  },
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonials" className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900" />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            <span className="text-sm font-medium text-white/90">
              Loved by Thousands
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            What Our Users Say
          </h2>
          <p className="text-lg text-white/70">
            Join thousands of happy users who have transformed their eating habits with Balanced Plate.
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/20">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl">
              <Quote className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="mt-4">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl text-white leading-relaxed mb-8">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl">
                    {currentTestimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-white/60">
                      {currentTestimonial.role}
                    </div>
                  </div>
                </div>

                {/* Highlight Badge */}
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 border border-green-400/30">
                  <span className="text-sm font-medium text-green-300">
                    ✨ {currentTestimonial.highlight}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(idx);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'w-8 bg-gradient-to-r from-green-400 to-emerald-400'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevTestimonial}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {[
            { label: 'App Store', rating: '4.9' },
            { label: 'Play Store', rating: '4.8' },
            { label: 'Product Hunt', rating: '#1 Product' },
            { label: 'Trustpilot', rating: 'Excellent' },
          ].map((badge, idx) => (
            <div key={idx} className="text-center">
              <div className="text-2xl font-bold text-white">{badge.rating}</div>
              <div className="text-sm text-white/60">{badge.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
