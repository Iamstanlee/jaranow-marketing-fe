import React from 'react';
import { motion } from 'framer-motion';
import { SubscriptionPlan } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'lite',
    name: 'Lite Plan',
    price: 9999,
    currency: '₦',
    washCount: 2,
    maxClothes: 15,
    features: [
      'Premium Machine wash',
      'Iron and folding included',
      '2 washes per month',
      'Max 15 clothes per wash',
      'Free pickup and delivery',
      'Same-day service available',
      'Dedicated customer support',
      'Quality guarantee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 15999,
    currency: '₦',
    washCount: 4,
    maxClothes: 15,
    isPopular: true,
    features: [
      'Premium Hand/Machine wash',
      'Iron and folding included',
      '4 washes per month',
      'Max 15 clothes per wash',
      'Free pickup and delivery',
      'Priority same-day service',
      'Stain treatment included',
      'Dedicated premium support',
      'Quality guarantee'
    ]
  }
];

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-20 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-graphik-bold">
            Choose Your <span className="text-primary-600">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible subscription plans designed for busy Nigerians. 
            No contracts, cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                plan.isPopular ? 'border-2 border-primary-500' : 'border border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 flex flex-col h-full">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {plan.washCount} washes • Up to {plan.maxClothes} clothes each
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">

                  {plan.isPopular && (
                      <p className="text-center text-sm text-gray-500 mb-2">
                        🎉 Early bird pricing - Save ₦3,000 for the first 3 months!
                      </p>
                  )}
                  <motion.button
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      plan.isPopular
                        ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started with {plan.name}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600">
            <span className="font-semibold">Money-back guarantee:</span> Not satisfied? Get a full refund within 7 days.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPlans;