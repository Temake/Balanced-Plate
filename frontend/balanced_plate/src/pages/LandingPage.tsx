import React from 'react';
import {
  Navbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  CTASection,
  Footer,
} from '@/components/landing';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;

    if (isPWA && user) {
      navigate("/dashboard", { replace: true });
    }
    // else if (isPWA && !user) {
    //   navigate("/login", { replace: true });
    // }
  }, [user, navigate]);

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
