import React from 'react';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from '@/components/landing';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
