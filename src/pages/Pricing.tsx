import React, { useState, useEffect } from 'react';
import {motion} from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Smartphone, Shield, Car, Sparkles, MapPin } from 'lucide-react';
import { SubscriptionPlan } from '../types';
import { formatCurrency } from '../utils/formatters';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PlanRecommendation from '../components/wash/PlanRecommendation';

type ServiceTab = 'carwash' | 'wash';

const Pricing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const [activeTab, setActiveTab] = useState<ServiceTab>(
    serviceParam === 'wash' ? 'wash' : 'carwash'
  );

  useEffect(() => {
    const service = searchParams.get('service');
    if (service === 'wash') {
      setActiveTab('wash');
    } else if (service === 'carwash' || service === 'delivery') {
      // `delivery` is a legacy value kept working as a redirect to carwash.
      setActiveTab('carwash');
    }
  }, [searchParams]);

  const phoneNumber = "2349038622012";

  const handleCarwashBook = (washType?: string) => {
    const chosen = washType ? `\nWash type: ${washType}` : '';
    const message = `Hi Jaranow! I'd like to book a car wash at 6th Avenue, Gwarinpa, Abuja.${chosen}\n\nCan you help me get started?`;
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

  const handleTabChange = (tab: ServiceTab) => {
    setActiveTab(tab);
    setSearchParams({ service: tab });
  };

  const paymentMethods = [
    { name: "Bank Transfer (business account)", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Card Payment", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Mobile Wallets", icon: <Smartphone className="w-5 h-5" /> }
  ];

  const carwashOptions = [
    {
      name: 'Exterior Wash',
      price: '₦2,000',
      tagline: 'A clean, gleaming outside - quick and thorough.',
      includes: [
        'Full exterior hand wash',
        'Wheels & tyres cleaned',
        'Windows & mirrors wiped down',
        'Dried and finished by hand'
      ],
      icon: <Car className="w-7 h-7 text-primary-700" />,
      featured: false
    },
    {
      name: 'Full Wash',
      price: '₦3,000',
      tagline: 'Interior + exterior. Inside and out, spotless.',
      includes: [
        'Everything in the Exterior Wash',
        'Interior vacuum & wipe down',
        'Dashboard & console cleaned',
        'Mats cleaned and refreshed'
      ],
      icon: <Sparkles className="w-7 h-7 text-cyan-600" />,
      featured: true
    }
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
        'Dedicated premium support',
        'Quality guarantee'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Jaranow Pricing - Fixed-Price Car Wash & Premium Laundry in Abuja</title>
        <meta name="description" content="Transparent pricing for Carwash by Jaranow (Exterior ₦2,000, Full Wash ₦3,000) and premium laundry subscriptions. No hidden fees, no negotiation." />
        <meta name="keywords" content="Jaranow pricing, car wash cost Abuja, laundry service prices Nigeria, fixed price car wash Gwarinpa" />
        <link rel="canonical" href="https://jaranow.com/pricing" />
        <meta property="og:title" content="Jaranow Pricing - Simple & Transparent" />
        <meta property="og:description" content="Fixed-price car wash from ₦2,000. Premium laundry plans from ₦14,999/month. No hidden fees." />
        <meta property="og:url" content="https://jaranow.com/pricing" />
        <meta property="og:image" content="https://jaranow.com/jaranow/opengraph-pricing.png" />
        <meta name="twitter:image" content="https://jaranow.com/jaranow/opengraph-pricing.png" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Header
        ctaLabel={activeTab === 'carwash' ? 'Book a wash' : 'Schedule pickup'}
        onCtaClick={
          activeTab === 'carwash'
            ? () => handleCarwashBook()
            : () => { window.location.href = '/laundry#pricing'; }
        }
      />

      {/* Hero band (blends with the fixed header) */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Simple, <span className="text-cyan-300">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              No hidden fees. No negotiation. No surprises. Just honest pricing for premium service.
            </p>
          </div>

          {/* Service Tabs */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-2 shadow-lg inline-flex">
              <button
                onClick={() => handleTabChange('carwash')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'carwash'
                    ? 'bg-[#2563eb] text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Car className="w-5 h-5" />
                <span>Car Wash</span>
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
        </div>
      </section>

      {/* Pricing content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Car Wash Pricing */}
          {activeTab === 'carwash' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {carwashOptions.map((option) => (
                  <div
                    key={option.name}
                    className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      option.featured
                        ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-2xl'
                        : 'bg-white border border-gray-200 shadow-lg'
                    }`}
                  >
                    {option.featured && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-cyan-400 text-primary-900 px-5 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                          Most popular
                        </span>
                      </div>
                    )}

                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-white ${option.featured ? '' : 'shadow-sm'}`}>
                      {option.icon}
                    </div>

                    <h3 className={`text-2xl font-bold mb-2 ${option.featured ? 'text-white' : 'text-gray-900'}`}>
                      {option.name}
                    </h3>
                    <p className={`mb-6 ${option.featured ? 'text-white/80' : 'text-gray-600'}`}>
                      {option.tagline}
                    </p>

                    <div className="mb-8">
                      <span className={`text-5xl font-bold ${option.featured ? 'text-cyan-300' : 'text-primary-700'}`}>
                        {option.price}
                      </span>
                      <span className={`ml-2 ${option.featured ? 'text-white/70' : 'text-gray-500'}`}>/ wash</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {option.includes.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <Check className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${option.featured ? 'text-cyan-300' : 'text-green-500'}`} />
                          <span className={option.featured ? 'text-white/90' : 'text-gray-700'}>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleCarwashBook(option.name)}
                      className={`mt-auto w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                        option.featured
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-primary-900'
                          : 'bg-primary-700 hover:bg-primary-800 text-white'
                      }`}
                    >
                      Book {option.name}
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-center text-gray-500 mt-8 text-sm">
                Fixed price · No negotiation · No hidden charges
              </p>

              {/* Location + Payment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
                <div className="bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl p-8 border border-primary-200 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center space-x-2">
                    <MapPin className="w-6 h-6 text-[#2563eb]" />
                    <span>Where to find us</span>
                  </h3>
                  <p className="text-gray-700 text-center mb-2 font-semibold">6th Avenue, Gwarinpa, Abuja</p>
                  <p className="text-gray-600 text-center text-sm">Open daily · 8:00 AM – 7:00 PM. No appointment needed - just drive in.</p>
                </div>

                <div className="bg-gradient-to-br from-primary-100 to-blue-100 rounded-2xl p-8 border border-primary-200 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center space-x-2">
                    <Shield className="w-6 h-6 text-[#2563eb]" />
                    <span>How you pay</span>
                  </h3>
                  <div className="space-y-3">
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
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    Pay the fixed price to our Jaranow business account and drive off.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-12 text-center">
                <motion.button
                  onClick={() => handleCarwashBook()}
                  className="bg-[#2563eb] text-white px-12 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book a wash via WhatsApp
                </motion.button>
              </div>
            </div>
          )}

          {/* Wash Service Pricing */}
          {activeTab === 'wash' && (
            <div>
              {/* Plan Recommendation Tool */}
              <div className="mb-16">
                <PlanRecommendation />
              </div>

              {/* Comparison Banner */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-8 md:p-10 shadow-2xl">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl"></div>
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
                        <div className="text-3xl font-bold text-cyan-400 mb-1">40%</div>
                        <div className="text-white text-sm">Cost Savings</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">0</div>
                        <div className="text-white text-sm">Your Effort</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">100%</div>
                        <div className="text-white text-sm">Quality</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">Free</div>
                        <div className="text-white text-sm">Delivery</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Plans */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch mb-16">
                {washPlans.map((plan) => (
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
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
