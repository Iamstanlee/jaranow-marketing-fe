import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Smartphone, Shield, Package, Sparkles } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { formatCurrency } from '../utils/formatters';
import JaranowNavigation from '../components/jaranow/Navigation';
import JaranowFooter from '../components/jaranow/Footer';
import WashNavigation from '../components/wash/Navigation';
import WashFooter from '../components/wash/Footer';
import PlanRecommendation from '../components/wash/PlanRecommendation';

const Pricing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const [activeTab, setActiveTab] = useState<'delivery' | 'wash'>(
    serviceParam === 'wash' ? 'wash' : 'delivery'
  );

  useEffect(() => {
    const service = searchParams.get('service');
    if (service === 'wash' || service === 'delivery') {
      setActiveTab(service);
    }
  }, [searchParams]);

  const phoneNumber = "2349038622012";

  const handleDeliveryOrder = () => {
    const message = "Hi! I'd like to place an order for grocery delivery through Jaranow. Can you help me get started?";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  const handleWashPlanSelect = (plan: SubscriptionPlan) => {
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

  const handleTabChange = (tab: 'delivery' | 'wash') => {
    setActiveTab(tab);
    setSearchParams({ service: tab });
  };

  const paymentMethods = [
    { name: "Credit/Debit Cards", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Bank Transfer", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Mobile Wallets", icon: <Smartphone className="w-5 h-5" /> }
  ];

  const deliveryPricingBreakdown = [
    {
      item: "Service Charge",
      price: "₦500",
      description: "AI shopping, professional selection & packing",
      included: true
    },
    {
      item: "Delivery Fee",
      price: "₦500",
      description: "10-minute doorstep delivery guarantee",
      included: true
    },
  ];

  const deliveryBenefits = [
    "10-minute delivery guarantee",
    "Professional shopping & packing",
    "AI-powered voice ordering",
    "Camera shopping list recognition",
    "Real-time order tracking",
    "Fresh produce guarantee",
    "24/7 customer support",
    "No minimum order value"
  ];

  const washPlans: SubscriptionPlan[] = [
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

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Jaranow Pricing - Affordable Grocery Delivery & Laundry Services in Abuja</title>
        <meta name="description" content="Transparent pricing for Jaranow's 10-minute grocery delivery (₦1,000) and premium laundry subscription services. No hidden fees, no surge pricing." />
        <meta name="keywords" content="Jaranow pricing, grocery delivery cost Abuja, laundry service prices Nigeria, affordable delivery service" />
        <link rel="canonical" href="https://jaranow.com/pricing" />
        <meta property="og:title" content="Jaranow Pricing - Simple & Transparent" />
        <meta property="og:description" content="Affordable grocery delivery in 10 minutes for ₦1,000. Premium laundry plans from ₦14,999/month. No hidden fees." />
        <meta property="og:url" content="https://jaranow.com/pricing" />
        <meta property="og:type" content="website" />
      </Helmet>

      {activeTab === 'delivery' ? (
        <JaranowNavigation onOrderNow={handleDeliveryOrder} />
      ) : (
        <WashNavigation />
      )}

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple, <span className="text-[#2563eb]">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No hidden fees. No surge pricing. No surprises. Just honest pricing for premium service.
            </p>
          </motion.div>

          {/* Service Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl p-2 shadow-lg inline-flex">
              <button
                onClick={() => handleTabChange('delivery')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'delivery'
                    ? 'bg-[#2563eb] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Grocery Delivery</span>
              </button>
              <button
                onClick={() => handleTabChange('wash')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'wash'
                    ? 'bg-[#2563eb] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>Laundry Service</span>
              </button>
            </div>
          </div>

          {/* Grocery Delivery Pricing */}
          {activeTab === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Pricing Breakdown */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    How Much Does It Cost?
                  </h2>

                  <div className="space-y-4 mb-8">
                    {deliveryPricingBreakdown.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl border-2 bg-primary-50 border-primary-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <Check className="w-5 h-5 text-[#2563eb]" />
                            <span className="font-semibold text-gray-900">{item.item}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">{item.description}</p>
                        </div>
                        <div className="text-xl font-bold text-[#2563eb]">
                          {item.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <div className="flex items-center justify-between text-2xl font-bold">
                      <span className="text-gray-900">Total Per Order:</span>
                      <span className="text-[#2563eb]">₦1,000</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Plus the cost of your groceries - no markup!
                    </p>
                  </div>
                </div>

                {/* What You Get */}
                <div className="space-y-8">
                  <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      What You Get for ₦1,000
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {deliveryBenefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center text-sm text-gray-700"
                        >
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl p-8 border border-primary-200 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center space-x-2">
                      <Shield className="w-6 h-6 text-[#2563eb]" />
                      <span>Secure Payment Options</span>
                    </h3>

                    <div className="space-y-4">
                      {paymentMethods.map((method, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 bg-white rounded-lg p-4 border border-primary-200"
                        >
                          <div className="text-[#2563eb]">{method.icon}</div>
                          <span className="text-gray-700 font-medium">{method.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        <Shield className="w-4 h-4 inline text-[#2563eb] mr-1" />
                        All transactions are secured with bank-level encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Proposition */}
              <div className="mt-16">
                <div className="bg-gradient-to-r from-[#2563eb] to-primary-700 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Is ₦1,000 Worth Your Time?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-200 mb-2">2 Hours</div>
                      <div className="text-blue-100">Time saved per shop</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-200 mb-2">₦500</div>
                      <div className="text-blue-100">Cost per hour saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-200 mb-2">10 Min</div>
                      <div className="text-blue-100">From order to delivery</div>
                    </div>
                  </div>
                  <p className="text-blue-100 text-lg mt-6 max-w-3xl mx-auto text-center">
                    For less than the cost of a meal, get back hours of your life every week.
                    That's time you can spend with family, pursuing hobbies, or growing your business.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 text-center">
                <motion.button
                  onClick={handleDeliveryOrder}
                  className="bg-[#2563eb] text-white px-12 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Order Now via WhatsApp
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Wash Service Pricing */}
          {activeTab === 'wash' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Plan Recommendation Tool */}
              <div className="mb-16">
                <PlanRecommendation />
              </div>

              {/* Comparison Banner */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-8 md:p-10 shadow-2xl">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        40% Cheaper & Way More Convenient
                      </h3>
                      <p className="text-blue-100 text-lg">
                        than traditional laundry services in Abuja
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                </div>
              </div>

              {/* Subscription Plans */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-16">
                {washPlans.map((plan, index) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                      plan.isPopular ? 'border-2 border-blue-500' : 'border border-gray-200'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
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
                            <Check className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto">
                        <motion.button
                          onClick={() => handleWashPlanSelect(plan)}
                          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                            plan.isPopular
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-900 hover:bg-gray-800 text-white'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Get Started with {plan.name}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Pricing */}
              <div className="max-w-4xl mx-auto">
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
                      {[
                        'Premium wash, iron and folding included',
                        'Free pickup and delivery',
                        'No monthly commitment required',
                        'Perfect for occasional washing needs',
                        'Quality guarantee'
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
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
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {activeTab === 'delivery' ? (
        <JaranowFooter />
      ) : (
        <WashFooter />
      )}
    </div>
  );
};

export default Pricing;
