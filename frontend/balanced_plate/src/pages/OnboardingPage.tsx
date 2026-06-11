import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Leaf, ArrowRight, ArrowLeft, Check, Loader2,
  TrendingDown, Dumbbell, Zap, HeartPulse,
  Utensils, Carrot, Egg, WheatOff,
  Droplet, Activity, Stethoscope, Pill, AlertTriangle, AlertCircle, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OnboardingData } from '@/api/types';



const goals = [
  { id: 'weight_loss', icon: TrendingDown, label: 'Lose weight', desc: 'Shed excess body fat while eating Nigerian meals you love' },
  { id: 'muscle_gain', icon: Dumbbell, label: 'Build muscle', desc: 'Gain lean mass with proper protein from local foods' },
  { id: 'energy_focus', icon: Zap, label: 'More energy', desc: 'Stay sharp and energized throughout a busy day' },
  { id: 'general_health', icon: HeartPulse, label: 'Eat healthier', desc: 'General wellness — eat balanced without stress' },
];

const dietPreferences = [
  { id: 'none', icon: Utensils, label: 'No restriction', desc: 'I eat everything' },
  { id: 'vegetarian', icon: Carrot, label: 'Vegetarian', desc: 'No meat, but eggs and dairy OK' },
  { id: 'vegan', icon: Leaf, label: 'Vegan', desc: 'Purely plant-based' },
  { id: 'keto', icon: Egg, label: 'Keto / Low-carb', desc: 'Minimal carbs, high fat' },
  { id: 'gluten_free', icon: WheatOff, label: 'Gluten-free', desc: 'Avoid wheat and gluten products' },
];

const healthConditions = [
  { id: 'none', icon: Check, label: 'None' },
  { id: 'diabetes', icon: Droplet, label: 'Diabetes' },
  { id: 'hypertension', icon: Activity, label: 'High blood pressure' },
  { id: 'cholesterol', icon: HeartPulse, label: 'High cholesterol' },
  { id: 'pcos', icon: Stethoscope, label: 'PCOS' },
  { id: 'ulcer', icon: Pill, label: 'Ulcer' },
  { id: 'kidney', icon: AlertCircle, label: 'Kidney issues' },
  { id: 'allergy', icon: AlertTriangle, label: 'Food allergies' },
];

// ── Component ──

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeOnboarding, isLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const totalSteps = 5; // Welcome, Goal, Diet, Health, All Set

  const toggleCondition = (id: string) => {
    if (id === 'none') {
      setSelectedConditions(['none']);
      return;
    }
    setSelectedConditions((prev) => {
      const filtered = prev.filter((c) => c !== 'none');
      return filtered.includes(id) ? filtered.filter((c) => c !== id) : [...filtered, id];
    });
  };

  const canProceed = () => {
    if (step === 0) return true; // Welcome
    if (step === 1) return !!selectedGoal;
    if (step === 2) return !!selectedDiet;
    if (step === 3) return selectedConditions.length > 0;
    if (step === 4) return true;
    return false;
  };

  const handleComplete = async () => {
    const data: OnboardingData = {
      dietary_goal: selectedGoal,
      dietary_preference: selectedDiet,
      health_conditions: selectedConditions.filter((c) => c !== 'none'),
    };

    try {
      await completeOnboarding(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error is set in context, we'll show it
    }
  };

  const handleSkip = async () => {
    const data: OnboardingData = {
      dietary_goal: 'general_health',
      dietary_preference: 'none',
      health_conditions: [],
    };

    try {
      await completeOnboarding(data);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error is set in context, we'll show it
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            Balanced<span className="text-emerald-600 dark:text-emerald-400"> Plate</span>
          </span>
        </div>

        {step > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-lg">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to Balanced Plate
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-2 max-w-sm mx-auto">
                Let's set up your profile so we can give you personalised food advice.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                This takes less than a minute. You can always change these later.
              </p>
            </div>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                What's your main goal?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This helps us tailor your food advice and meal suggestions.
              </p>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedGoal === goal.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/30'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <goal.icon className={`w-6 h-6 shrink-0 ${
                      selectedGoal === goal.id
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{goal.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{goal.desc}</div>
                    </div>
                    {selectedGoal === goal.id && (
                      <Check className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Diet Preference */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Any dietary preferences?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                We'll only recommend meals that fit your eating style.
              </p>
              <div className="space-y-3">
                {dietPreferences.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => setSelectedDiet(pref.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedDiet === pref.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/30'
                        : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <pref.icon className={`w-6 h-6 shrink-0 ${
                      selectedDiet === pref.id
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{pref.label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{pref.desc}</div>
                    </div>
                    {selectedDiet === pref.id && (
                      <Check className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Health Conditions */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Any health conditions?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Select any that apply. This keeps our AI advice safe for you.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {healthConditions.map((cond) => {
                  const isSelected = selectedConditions.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      onClick={() => toggleCondition(cond.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500/30'
                          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                    >
                      <cond.icon className={`w-5 h-5 shrink-0 ${
                        isSelected
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{cond.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: All Set */}
          {step === 4 && (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                All set!
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                We'll guide your meals based on your lifestyle, food preferences, and health needs.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBack}
                className="h-11 px-5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="h-11 px-6 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white ml-auto transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {step === 0 ? "Let's go" : step === totalSteps - 1 ? 'Finish Setup' : 'Continue'}
              {!isLoading && step < totalSteps - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          {/* Skip */}
          {step > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Skip for now — I'll set this up later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
