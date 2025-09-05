import React from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Smartphone, Shield, X } from 'lucide-react';

const Pricing: React.FC = () => {
  const paymentMethods = [
    { name: "Credit/Debit Cards", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Bank Transfer", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Mobile Wallets", icon: <Smartphone className="w-5 h-5" /> }
  ];

  const pricingBreakdown = [
    {
      item: "Service Charge",
      price: "NGN 1,000",
      description: "AI shopping, professional selection & packing",
      included: true
    },
    {
      item: "Delivery Fee", 
      price: "NGN 500",
      description: "10-minute doorstep delivery guarantee",
      included: true
    },
  ];

  const benefits = [
    "✅ 10-minute delivery guarantee",
    "✅ Professional shopping & packing",
    "✅ AI-powered voice ordering",
    "✅ Camera shopping list recognition",
    "✅ Real-time order tracking",
    "✅ Fresh produce guarantee",
    "✅ 24/7 customer support",
    "✅ No minimum order value"
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Simple, <span className="text-[#ff0023]">Transparent</span> Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No hidden fees, no surge pricing, no surprises. Just honest pricing for premium service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Pricing Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How Much Does It Cost?
              </h3>
              
              <div className="space-y-4 mb-8">
                {pricingBreakdown.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      item.included 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        {item.included ? (
                          <Check className="w-5 h-5 text-[#ff0023]" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-semibold text-gray-900">{item.item}</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-8">{item.description}</p>
                    </div>
                    <div className={`text-xl font-bold ${
                      item.included ? 'text-[#ff0023]' : 'text-red-600'
                    }`}>
                      {item.price}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span className="text-gray-900">Total Per Order:</span>
                  <span className="text-[#ff0023]">NGN 1,500</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Plus the cost of your groceries - no markup!
                </p>
              </div>
            </div>
          </motion.div>

          {/* What You Get */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Benefits */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                What You Get for NGN 1,500
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <span className="mr-2">{benefit.split(' ')[0]}</span>
                    <span>{benefit.substring(2)}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-8 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center space-x-2">
                <Shield className="w-6 h-6 text-[#ff0023]" />
                <span>Secure Payment Options</span>
              </h3>
              
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 bg-white rounded-lg p-4 border border-red-200"
                  >
                    <div className="text-[#ff0023]">{method.icon}</div>
                    <span className="text-gray-700 font-medium">{method.name}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <Shield className="w-4 h-4 inline text-[#ff0023] mr-1" />
                  All transactions are secured with bank-level encryption
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-[#ff0023] to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Is NGN 1,500 Worth Your Time?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-200 mb-2">2 Hours</div>
                <div className="text-red-100">Time saved per shop</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-200 mb-2">NGN 750</div>
                <div className="text-red-100">Cost per hour saved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-200 mb-2">10 Min</div>
                <div className="text-red-100">From order to delivery</div>
              </div>
            </div>
            <p className="text-red-100 text-lg mt-6 max-w-3xl mx-auto">
              For less than the cost of a meal, get back hours of your life every week. 
              That's time you can spend with family, pursuing hobbies, or growing your business.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;