import React from 'react';
import {motion} from 'framer-motion';
import {SubscriptionPlan} from '../../types';
import {formatCurrency} from '../../utils/formatters';

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'lite',
    name: 'Lite Plan',
    price: 14999,
    currency: '₦',
    washCount: 2,
    maxClothes: 12,
    features: [
      'Premium Hand/Machine wash',
      'Iron and folding included',
      '2 washes per month',
      'Max 12 clothes per wash',
      'Free pickup and delivery (Pickup days: Tuesday & Thursday)',
      'Dedicated premium support',
      'Quality guarantee'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 24999,
    currency: '₦',
    washCount: 3,
    maxClothes: 15,
    isPopular: true,
    features: [
      'Premium Hand/Machine wash',
      'Iron and folding included',
      '3 washes per month',
      'Max 15 clothes per wash',
      'Special clothing (suit, longdress, towel, duvet set, curtains)',
      'Free pickup and delivery (Pickup days: Tuesday, Thursday & Saturday)',
      'Priority same-day service',
      'Dedicated premium support',
      'Quality guarantee'
    ]
  }
];

const PricingPlans: React.FC<PricingPlansProps> = () => {
  const phoneNumber = '2349038622012';

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    const message = `Hi Jaranow! I'm interested in scheduling laundry pickup for the _${plan.name}_ (₦${plan.price.toLocaleString()}/month).

${plan.name} Details:
• ${plan.features.join('\n• ')}

I'd like to get started. When is the next available pickup?`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCustomPlanSelect = () => {
    const message = `Hi Jaranow! I'm interested in scheduling laundry pickup for the _Custom Pricing Plan_.

Custom Plan Details:
• Pay as you go - no monthly commitment
• ₦700 per regular item (shirts, trousers, dresses, skirts, tops, etc.)
• ₦2,000 per special item (suits, long dresses, towels, duvet sets, curtains)
• Premium wash, iron and folding included
• Free pickup and delivery

I'd like to get started. When is the next available pickup?`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-bold">
            Choose Your <span className="text-primary-600">Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible subscription plans designed for busy Nigerians.
            No contracts, cancel anytime.
          </p>
        </motion.div>

        {/* Comparison Banner */}
        <motion.div
          className="max-w-5xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 md:p-10 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Why Choose Jaranow?
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    40% Cheaper & Way More Convenient
                  </h3>
                  <p className="text-blue-100 text-lg">
                    than traditional laundry services in Abuja
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">40%</div>
                    <div className="text-white text-sm">Cost Savings</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">0</div>
                    <div className="text-white text-sm">Your Effort</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">100%</div>
                    <div className="text-white text-sm">Quality</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">Free</div>
                    <div className="text-white text-sm">Delivery</div>
                  </div>
                </div>
              </div>

              {/* Additional benefits */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">No hidden fees</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-white">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Same-day service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  <motion.button
                      onClick={() => handlePlanSelect(plan)}
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
                <p className="text-gray-600 text-lg mb-4">No commitment, pay as you go</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-blue-700">
                        {formatCurrency(700)}
                      </span>
                      <span className="text-gray-600 ml-2">/item</span>
                    </div>
                    <p className="text-gray-700 font-semibold">Regular Items</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-purple-700">
                        {formatCurrency(2000)}
                      </span>
                      <span className="text-gray-600 ml-2">/item</span>
                    </div>
                    <p className="text-gray-700 font-semibold">Special Items</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h4 className="font-bold text-gray-900 text-lg mb-4">Pricing Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-lg px-3 py-1 mr-4 flex-shrink-0">
                      <span className="font-bold text-blue-700">₦700</span>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">Regular items</p>
                      <p className="text-gray-600 text-sm">Shirts, trousers, dresses, skirts, tops, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-lg px-3 py-1 mr-4 flex-shrink-0">
                      <span className="font-bold text-purple-700">₦2,000</span>
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
                  onClick={handleCustomPlanSelect}
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