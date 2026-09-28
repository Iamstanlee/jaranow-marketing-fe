import React, { useState } from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { btn, Container, SectionHeader, openWhatsApp } from '../common/ui';

interface RecommendationResult {
  recommendedPlan: 'lite' | 'premium' | 'custom';
  reasons: string[];
  estimatedMonthlyCost?: number;
  clothesPerMonth: number;
}

type FieldKey = 'washFrequency' | 'clothesPerWash' | 'hasSpecialItems' | 'budget';

interface Question {
  field: FieldKey;
  title: string;
  hint: string;
  options: Array<{ value: string; label: string; subtitle: string }>;
}

const questions: Question[] = [
  {
    field: 'washFrequency',
    title: 'How often do you need a wash?',
    hint: 'How many times a month would you like us to collect?',
    options: [
      { value: '1', label: 'Once a month', subtitle: 'Light, occasional use' },
      { value: '2', label: 'Twice a month', subtitle: 'A steady rhythm' },
      { value: '3', label: '3 times a month', subtitle: 'A busy household' },
      { value: '4', label: '4+ times a month', subtitle: 'A lot going through' },
    ],
  },
  {
    field: 'clothesPerWash',
    title: 'How many clothes per wash?',
    hint: 'A rough count of the items you would send each time.',
    options: [
      { value: '8', label: '5–10 items', subtitle: 'Light load' },
      { value: '12', label: '10–15 items', subtitle: 'Medium load' },
      { value: '18', label: '15–20 items', subtitle: 'Heavy load' },
      { value: '25', label: '20+ items', subtitle: 'Extra heavy load' },
    ],
  },
  {
    field: 'hasSpecialItems',
    title: 'Any special items?',
    hint: 'Suits, long dresses, towels, duvet sets and curtains.',
    options: [
      { value: 'yes', label: 'Yes, some special items', subtitle: 'Suits, dresses, duvets and the like' },
      { value: 'no', label: 'No, mostly everyday clothes', subtitle: 'Shirts, trousers, tops' },
    ],
  },
  {
    field: 'budget',
    title: 'What do you expect to spend a month?',
    hint: 'So we point you at an option that fits.',
    options: [
      { value: '10000', label: 'Under ₦15,000', subtitle: 'Pay per item likely suits' },
      { value: '15000', label: '₦15,000 – ₦20,000', subtitle: 'Around the Lite Plan' },
      { value: '25000', label: '₦20,000 – ₦30,000', subtitle: 'Around the Premium Plan' },
      { value: '35000', label: 'Above ₦30,000', subtitle: 'Open' },
    ],
  },
];

const PLAN_LABELS = { lite: 'Lite Plan', premium: 'Premium Plan', custom: 'Pay per item' } as const;

interface PlanRecommendationProps {
  /** Hide the section heading when the page already carries one (the plan-finder page). */
  showHeader?: boolean;
}

const PlanRecommendation: React.FC<PlanRecommendationProps> = ({ showHeader = true }) => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    washFrequency: '',
    clothesPerWash: '',
    hasSpecialItems: '',
    budget: ''
  });
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const calculateRecommendation = (): RecommendationResult => {
    const washesPerMonth = parseInt(formData.washFrequency) || 0;
    const clothesPerWash = parseInt(formData.clothesPerWash) || 0;
    const hasSpecialItems = formData.hasSpecialItems === 'yes';
    const budget = parseInt(formData.budget) || 0;
    const totalClothesPerMonth = washesPerMonth * clothesPerWash;

    const reasons: string[] = [];
    let recommendedPlan: 'lite' | 'premium' | 'custom' = 'lite';
    let estimatedMonthlyCost: number | undefined;

    // Decision logic
    if (washesPerMonth <= 1 || totalClothesPerMonth <= 15) {
      // Low volume - recommend custom pricing
      recommendedPlan = 'custom';
      reasons.push('Your volume is light enough that paying per item suits you better than a plan');
      reasons.push('No monthly plan - you pay for what you send');

      const estimatedRegularItems = hasSpecialItems ? clothesPerWash * 0.7 : clothesPerWash;
      const estimatedSpecialItems = hasSpecialItems ? clothesPerWash * 0.3 : 0;
      const costPerWash = (estimatedRegularItems * 700) + (estimatedSpecialItems * 2000);
      estimatedMonthlyCost = Math.round(costPerWash * washesPerMonth);
    } else if (washesPerMonth === 2 && clothesPerWash <= 12 && !hasSpecialItems) {
      // Perfect fit for Lite
      recommendedPlan = 'lite';
      reasons.push('Your needs perfectly match the Lite Plan (2 washes, up to 12 clothes each)');
      reasons.push('A predictable rhythm - two scheduled pickups you never have to think about');
      if (budget && budget < 20000) {
        reasons.push('Sits within what you expect to spend');
      }
    } else if ((washesPerMonth >= 3 || clothesPerWash > 12 || hasSpecialItems) && totalClothesPerMonth <= 45) {
      // Good fit for Premium
      recommendedPlan = 'premium';
      if (washesPerMonth >= 3) {
        reasons.push('You need 3+ washes per month - Premium Plan includes 3 scheduled pickups');
      }
      if (clothesPerWash > 12) {
        reasons.push('With more than 12 clothes per wash, Premium Plan supports up to 15 clothes per wash');
      }
      if (hasSpecialItems) {
        reasons.push('Premium Plan includes special items like suits, long dresses, and duvet sets');
      }
      reasons.push('Built for your volume, so nothing gets rushed or left behind');
    } else if (totalClothesPerMonth > 45) {
      // Volume exceeds both plans
      recommendedPlan = 'premium';
      reasons.push('Premium Plan is built to handle high-volume needs without cutting corners');
      reasons.push('Consider splitting across multiple pickup days (Tuesday, Thursday, Saturday)');
      reasons.push('Additional items can be added with custom pricing as needed');
    }

    // Budget considerations
    if (budget && budget < 15000) {
      recommendedPlan = 'custom';
      reasons.length = 0;
      reasons.push('For what you expect to spend, paying per item fits best');
      reasons.push('No monthly plan - you pay for what you send');

      const estimatedRegularItems = hasSpecialItems ? clothesPerWash * 0.7 : clothesPerWash;
      const estimatedSpecialItems = hasSpecialItems ? clothesPerWash * 0.3 : 0;
      const costPerWash = (estimatedRegularItems * 700) + (estimatedSpecialItems * 2000);
      estimatedMonthlyCost = Math.round(costPerWash * washesPerMonth);
    } else if (budget && budget >= 25000 && recommendedPlan === 'lite' && (hasSpecialItems || totalClothesPerMonth > 20)) {
      recommendedPlan = 'premium';
      reasons.push('Premium gives you a third pickup day and covers special items');
    }

    return {
      recommendedPlan,
      reasons,
      estimatedMonthlyCost,
      clothesPerMonth: totalClothesPerMonth
    };
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const result = calculateRecommendation();
      setRecommendation(result);
      setStep(5);
    }
  };

  const handleBack = () => {
    if (step > 1 && step <= 4) {
      setStep(step - 1);
    } else if (step === 5) {
      setStep(4);
      setRecommendation(null);
    }
  };

  const handleRestart = () => {
    setStep(1);
    setFormData({
      washFrequency: '',
      clothesPerWash: '',
      hasSpecialItems: '',
      budget: ''
    });
    setRecommendation(null);
  };

  const handlePlanSelect = (planType: string) => {
    let message = '';

    if (planType === 'lite') {
      message = `Hi Jaranow! I used the plan recommendation tool and I'm interested in the Lite Plan (₦14,999/month).

My estimated needs:
• ${formData.washFrequency} washes per month
• About ${formData.clothesPerWash} clothes per wash

I'd like to get started. When is the next available pickup?`;
    } else if (planType === 'premium') {
      message = `Hi Jaranow! I used the plan recommendation tool and I'm interested in the Premium Plan (₦24,999/month).

My estimated needs:
• ${formData.washFrequency} washes per month
• About ${formData.clothesPerWash} clothes per wash
• ${formData.hasSpecialItems === 'yes' ? 'I have special items (suits, dresses, etc.)' : 'Mostly regular items'}

I'd like to get started. When is the next available pickup?`;
    } else {
      message = `Hi Jaranow! I used the plan recommendation tool and I'm interested in Custom Pricing.

My estimated needs:
• ${formData.washFrequency} washes per month
• About ${formData.clothesPerWash} clothes per wash
• ${formData.hasSpecialItems === 'yes' ? 'I have special items (suits, dresses, etc.)' : 'Mostly regular items'}

I'd like to get started with pay-as-you-go pricing. When is the next available pickup?`;
    }

    openWhatsApp(message);
  };

  const question = step <= 4 ? questions[step - 1] : null;
  const isStepComplete = () => !question || formData[question.field] !== '';
  const progress = step <= 4 ? (step / 4) * 100 : 100;

  const card = (
    <div className="rounded-3xl border border-ink/10 bg-white p-7 sm:p-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-ink/60">{step <= 4 ? `Question ${step} of 4` : 'Your recommendation'}</span>
          <span className="font-medium tabular-nums text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-primary-600 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {question && (
          <motion.div
            key={question.field}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="text-2xl font-bold tracking-tight text-ink">{question.title}</h3>
            <p className="mt-2 text-ink/60">{question.hint}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label={question.title}>
              {question.options.map((option) => {
                const selected = formData[question.field] === option.value;
                return (
                  <button
                    key={option.value}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setFormData({ ...formData, [question.field]: option.value })}
                    className={`flex items-start justify-between gap-4 rounded-2xl border p-5 text-left transition-colors ${
                      selected ? 'border-primary-600 bg-primary-50' : 'border-ink/10 hover:border-ink/30'
                    }`}
                  >
                    <span>
                      <span className="block font-medium text-ink">{option.label}</span>
                      <span className="mt-1 block text-sm text-ink/55">{option.subtitle}</span>
                    </span>
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                        selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-ink/20'
                      }`}
                    >
                      {selected && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {step === 5 && recommendation && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium text-ink/60">Based on about {recommendation.clothesPerMonth} clothes a month</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-ink">
              We'd suggest the <span className="text-primary-600">{PLAN_LABELS[recommendation.recommendedPlan]}</span>
            </h3>

            <div className="mt-8 rounded-2xl bg-paper p-6 sm:p-8">
              <p className="flex items-baseline gap-2">
                {recommendation.recommendedPlan === 'lite' && (
                  <>
                    <span className="text-4xl font-bold tracking-tight text-ink">₦14,999</span>
                    <span className="text-ink/50">per month · 2 washes, up to 12 clothes each</span>
                  </>
                )}
                {recommendation.recommendedPlan === 'premium' && (
                  <>
                    <span className="text-4xl font-bold tracking-tight text-ink">₦24,999</span>
                    <span className="text-ink/50">per month · 3 washes, up to 15 clothes each</span>
                  </>
                )}
                {recommendation.recommendedPlan === 'custom' && recommendation.estimatedMonthlyCost && (
                  <>
                    <span className="text-sm text-ink/50">About</span>
                    <span className="text-4xl font-bold tracking-tight text-ink">
                      ₦{recommendation.estimatedMonthlyCost.toLocaleString()}
                    </span>
                    <span className="text-ink/50">a month, paid per item</span>
                  </>
                )}
              </p>

              <ul className="mt-6 space-y-3 border-t border-ink/10 pt-6">
                {recommendation.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3 text-ink/75">
                    <Check size={18} className="mt-0.5 flex-shrink-0 text-primary-600" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => handlePlanSelect(recommendation.recommendedPlan)} className={`${btn.primary} group flex-1`}>
                Arrange it on WhatsApp
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </button>
              <button onClick={handleRestart} className={`${btn.ghostOnLight} flex-1`}>
                <RotateCcw size={16} />
                Start over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {step <= 4 && (
        <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-ink/70 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepComplete()}
            className={`${btn.ink} px-6 py-3 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40`}
          >
            {step === 4 ? 'See my recommendation' : 'Next'}
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );

  if (!showHeader) {
    return card;
  }

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-12">
        <SectionHeader
          className="lg:col-span-4"
          eyebrow="Plan finder"
          title="Not sure which plan?"
          intro="Four quick questions about your week, and we'll point you to the option that fits how you actually live."
        />
        <div className="lg:col-span-8">{card}</div>
      </Container>
    </section>
  );
};

export default PlanRecommendation;
