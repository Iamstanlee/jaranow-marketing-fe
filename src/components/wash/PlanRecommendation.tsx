import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface RecommendationResult {
  recommendedPlan: 'lite' | 'premium' | 'custom';
  reasons: string[];
  estimatedMonthlyCost?: number;
  clothesPerMonth: number;
}

const PlanRecommendation: React.FC = () => {
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
      reasons.push('Your wash volume is low enough that custom pricing would be more cost-effective');
      reasons.push('No monthly commitment required - perfect for occasional needs');

      const estimatedRegularItems = hasSpecialItems ? clothesPerWash * 0.7 : clothesPerWash;
      const estimatedSpecialItems = hasSpecialItems ? clothesPerWash * 0.3 : 0;
      const costPerWash = (estimatedRegularItems * 700) + (estimatedSpecialItems * 2000);
      estimatedMonthlyCost = Math.round(costPerWash * washesPerMonth);
    } else if (washesPerMonth === 2 && clothesPerWash <= 12 && !hasSpecialItems) {
      // Perfect fit for Lite
      recommendedPlan = 'lite';
      reasons.push('Your needs perfectly match the Lite Plan (2 washes, up to 12 clothes each)');
      reasons.push('Best value at ₦14,999/month with predictable costs');
      if (budget && budget < 20000) {
        reasons.push('Fits comfortably within your budget');
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
        reasons.push('Priority same-day service ensures faster turnaround for your special items');
      }
      reasons.push('Better value than custom pricing at this volume (₦24,999/month)');
    } else if (totalClothesPerMonth > 45) {
      // Volume exceeds both plans
      recommendedPlan = 'premium';
      reasons.push('Premium Plan offers the best value for high-volume needs');
      reasons.push('Consider splitting across multiple pickup days (Tuesday, Thursday, Saturday)');
      reasons.push('Additional items can be added with custom pricing as needed');
    }

    // Budget considerations
    if (budget && budget < 15000) {
      recommendedPlan = 'custom';
      reasons.length = 0;
      reasons.push('Based on your budget, custom pricing would be more suitable');
      reasons.push('Pay only for what you need without monthly commitment');

      const estimatedRegularItems = hasSpecialItems ? clothesPerWash * 0.7 : clothesPerWash;
      const estimatedSpecialItems = hasSpecialItems ? clothesPerWash * 0.3 : 0;
      const costPerWash = (estimatedRegularItems * 700) + (estimatedSpecialItems * 2000);
      estimatedMonthlyCost = Math.round(costPerWash * washesPerMonth);
    } else if (budget && budget >= 25000 && recommendedPlan === 'lite' && (hasSpecialItems || totalClothesPerMonth > 20)) {
      recommendedPlan = 'premium';
      reasons.push('Your budget allows for Premium Plan with more flexibility and benefits');
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
    const phoneNumber = '2349038622012';
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

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.washFrequency !== '';
      case 2:
        return formData.clothesPerWash !== '';
      case 3:
        return formData.hasSpecialItems !== '';
      case 4:
        return formData.budget !== '';
      default:
        return true;
    }
  };

  const renderProgressBar = () => {
    const progress = step <= 4 ? (step / 4) * 100 : 100;
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            {step <= 4 ? `Step ${step} of 4` : 'Your Recommendation'}
          </span>
          <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Smart Recommendation
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-bold">
            Find Your <span className="text-primary-600">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Answer a few quick questions and we'll recommend the best plan for your needs
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {renderProgressBar()}

          <AnimatePresence mode="wait">
            {/* Step 1: Wash Frequency */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  How often do you need laundry service?
                </h3>
                <p className="text-gray-600 mb-6">
                  Select how many times per month you'd like us to pick up your laundry
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: '1', label: 'Once a month', subtitle: 'Perfect for light users' },
                    { value: '2', label: 'Twice a month', subtitle: 'Most popular choice' },
                    { value: '3', label: '3 times a month', subtitle: 'Great for busy professionals' },
                    { value: '4', label: '4+ times a month', subtitle: 'For heavy users' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, washFrequency: option.value })}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                        formData.washFrequency === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.subtitle}</p>
                        </div>
                        {formData.washFrequency === option.value && (
                          <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Clothes Per Wash */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  How many clothes per wash?
                </h3>
                <p className="text-gray-600 mb-6">
                  Estimate the number of items you'd send for each wash
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: '8', label: '5-10 items', subtitle: 'Light load' },
                    { value: '12', label: '10-15 items', subtitle: 'Medium load' },
                    { value: '18', label: '15-20 items', subtitle: 'Heavy load' },
                    { value: '25', label: '20+ items', subtitle: 'Extra heavy load' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, clothesPerWash: option.value })}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                        formData.clothesPerWash === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.subtitle}</p>
                        </div>
                        {formData.clothesPerWash === option.value && (
                          <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Special Items */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Do you have special items?
                </h3>
                <p className="text-gray-600 mb-6">
                  Special items include suits, long dresses, towels, duvet sets, and curtains
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      value: 'yes',
                      label: 'Yes, I have special items',
                      subtitle: 'Suits, dresses, duvets, etc.',
                      icon: CheckCircle
                    },
                    {
                      value: 'no',
                      label: 'No, mostly regular items',
                      subtitle: 'Shirts, trousers, tops, etc.',
                      icon: XCircle
                    }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, hasSpecialItems: option.value })}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                        formData.hasSpecialItems === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.subtitle}</p>
                        </div>
                        {formData.hasSpecialItems === option.value && (
                          <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  What's your monthly budget?
                </h3>
                <p className="text-gray-600 mb-6">
                  This helps us recommend the most cost-effective option for you
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: '10000', label: 'Under ₦15,000', subtitle: 'Budget-friendly' },
                    { value: '15000', label: '₦15,000 - ₦20,000', subtitle: 'Lite Plan range' },
                    { value: '25000', label: '₦20,000 - ₦30,000', subtitle: 'Premium Plan range' },
                    { value: '35000', label: 'Above ₦30,000', subtitle: 'Flexible budget' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, budget: option.value })}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 ${
                        formData.budget === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.subtitle}</p>
                        </div>
                        {formData.budget === option.value && (
                          <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Recommendation */}
            {step === 5 && recommendation && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <Sparkles className="w-8 h-8 text-primary-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    We Recommend the{' '}
                    <span className="text-primary-600">
                      {recommendation.recommendedPlan === 'lite'
                        ? 'Lite Plan'
                        : recommendation.recommendedPlan === 'premium'
                        ? 'Premium Plan'
                        : 'Custom Pricing'}
                    </span>
                  </h3>
                  <p className="text-gray-600">
                    Based on your needs of ~{recommendation.clothesPerMonth} clothes per month
                  </p>
                </div>

                {/* Recommendation Card */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-8 mb-6 border-2 border-primary-200">
                  {recommendation.recommendedPlan === 'lite' && (
                    <div>
                      <div className="flex items-baseline justify-center mb-4">
                        <span className="text-4xl font-bold text-gray-900">₦14,999</span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </div>
                      <p className="text-center text-gray-700 font-semibold mb-4">
                        Lite Plan - 2 washes, up to 12 clothes each
                      </p>
                    </div>
                  )}
                  {recommendation.recommendedPlan === 'premium' && (
                    <div>
                      <div className="flex items-baseline justify-center mb-4">
                        <span className="text-4xl font-bold text-gray-900">₦24,999</span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </div>
                      <p className="text-center text-gray-700 font-semibold mb-4">
                        Premium Plan - 3 washes, up to 15 clothes each
                      </p>
                    </div>
                  )}
                  {recommendation.recommendedPlan === 'custom' && (
                    <div>
                      {recommendation.estimatedMonthlyCost && (
                        <div className="flex items-baseline justify-center mb-4">
                          <span className="text-sm text-gray-600 mr-2">Estimated:</span>
                          <span className="text-4xl font-bold text-gray-900">
                            ₦{recommendation.estimatedMonthlyCost.toLocaleString()}
                          </span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                      )}
                      <p className="text-center text-gray-700 font-semibold mb-4">
                        Custom Pricing - Pay only for what you use
                      </p>
                    </div>
                  )}

                  <div className="bg-white/70 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Why this plan?</h4>
                    <ul className="space-y-2">
                      {recommendation.reasons.map((reason, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start text-sm text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={() => handlePlanSelect(recommendation.recommendedPlan)}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={handleRestart}
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Over
                  </motion.button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                  Not sure? Scroll down to view all plans and pricing details
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step <= 4 && (
            <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  step === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isStepComplete()
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {step === 4 ? 'Get Recommendation' : 'Next'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PlanRecommendation;
