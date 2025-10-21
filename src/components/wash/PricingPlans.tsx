import React from 'react';
import {motion} from 'framer-motion';
import {SubscriptionPlan} from '../../types';
import {formatCurrency} from '../../utils/formatters';

interface PricingPlansProps {
  onSelectPlan: (planId: string) => void;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'lite',
    name: 'Lite Plan',
    price: 14999,
    currency: 'NGN',
    washCount: 2,
    maxClothes: 12,
    features: [
      'Premium Machine wash',
      'Iron and folding included',
      '2 washes per month',
      'Max 12 clothes per wash',
      'Free pickup and delivery',
      'Dedicated premium support',
      'Quality guarantee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 24999,
    currency: 'NGN',
    washCount: 3,
    maxClothes: 15,
    isPopular: true,
    features: [
      'Premium Hand/Machine wash',
      'Iron and folding included',
      '3 washes per month',
      'Max 15 clothes per wash',
      'Special clothing (suit, longdress, towel, duvet set, curtains)',
      'Free pickup and delivery',
      'Priority same-day service',
      'Dedicated premium support',
      'Quality guarantee'
    ]
  }
];

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan }) => {
  return (
    <section id="pricing" className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
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
              className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
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
                        🎉 Early bird pricing - Save NGN 3,000 for the first 2 months!
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

        {/* Custom Pricing Section */}
        <motion.div
          className="mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-center">
              <h3 className="text-3xl font-bold text-white mb-2">Custom Pricing</h3>
              <p className="text-gray-300">Pay only for what you need - simple and flexible</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-5xl sm:text-6xl font-bold text-gray-900">
                    {formatCurrency(700)}
                  </span>
                  <span className="text-gray-500 ml-3 text-xl">/unit</span>
                </div>
                <p className="text-gray-600 text-lg">No commitment, pay as you go</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="font-bold text-gray-900 text-lg mb-4">Unit Counting</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-primary-100 rounded-lg px-3 py-1 mr-4 flex-shrink-0">
                      <span className="font-bold text-primary-700">1 unit</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">Regular items</p>
                      <p className="text-gray-600 text-sm">Shirts, trousers, dresses, skirts, tops, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary-100 rounded-lg px-3 py-1 mr-4 flex-shrink-0">
                      <span className="font-bold text-primary-700">2 units</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">Special items</p>
                      <p className="text-gray-600 text-sm">Suits, long dresses, towels, duvet sets, curtains</p>
                    </div>
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Premium wash, iron and folding included</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Free pickup and delivery</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">No monthly commitment required</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Perfect for occasional washing needs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Quality guarantee</span>
                </li>
              </ul>

              <motion.button
                onClick={() => onSelectPlan('custom')}
                className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started with Custom Pricing
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingPlans;