import React from 'react';
import { motion } from 'framer-motion';
import { Mic, ShoppingCart, Truck, Clock, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      icon: <Mic className="w-8 h-8" />,
      title: "Shop with Jara AI",
      description: "Use voice, camera, or text to tell Jara exactly what you need",
      details: [
        "🎤 Voice: 'Jara, I need rice, tomatoes, and cooking oil'",
        "📷 Camera: Photo your shopping list or empty containers",
        "✍️ Text: Paste or type your shopping list"
      ],
      color: "bg-blue-500",
      lightColor: "bg-blue-50"
    },
    {
      number: "02", 
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "We Shop & Pack",
      description: "Our professional shoppers carefully select and pack your items",
      details: [
        "🛒 Expert shoppers choose the freshest items",
        "🥬 Quality checked fruits and vegetables",
        "📦 Professionally packed for safe delivery"
      ],
      color: "bg-[#2563eb]",
      lightColor: "bg-red-50"
    },
    {
      number: "03",
      icon: <Truck className="w-8 h-8" />,
      title: "10-Minute Delivery",
      description: "Guaranteed doorstep delivery in exactly 10 minutes",
      details: [
        "⚡ 10-minute delivery guarantee",
        "🏠 Direct to your doorstep",
        "📱 Real-time delivery tracking"
      ],
      color: "bg-purple-500",
      lightColor: "bg-purple-50"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How <span className="text-[#2563eb]">Jaranow</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From thought to doorstep in just 3 simple steps - powered by AI
          </p>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
              <div className="flex justify-between items-center">
                <div className="w-1/3 h-0.5 bg-gradient-to-r from-blue-300 to-red-300"></div>
                <div className="w-1/3 h-0.5 bg-gradient-to-r from-red-300 to-purple-300"></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`${step.lightColor} rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 border border-gray-200`}>
                    {/* Step Number Circle */}
                    <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 mx-auto`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className={`${step.color} rounded-full p-4 inline-flex text-white mb-6`}>
                      {step.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className={`${step.lightColor} rounded-2xl p-6 border border-gray-200`}>
                <div className="flex items-start space-x-4">
                  <div className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {step.number}
                  </div>

                  <div className="flex-1">
                    <div className={`${step.color} rounded-full p-3 inline-flex text-white mb-4`}>
                      {step.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>

                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-sm text-gray-700 flex items-start">
                          <span className="mr-2">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-[#2563eb] to-red-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Clock className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Ready in 10 Minutes</h3>
            </div>
            <p className="text-red-100 text-lg mb-6 max-w-2xl mx-auto">
              From the moment you speak to Jara until your groceries arrive at your door - 
              the entire process takes just 10 minutes. That's our guarantee!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-red-100">
              <div className="text-center">
                <div className="font-bold">2 minutes</div>
                <div className="text-sm">Shopping & Packing</div>
              </div>
              <div className="text-center">
                <div className="font-bold">8 minutes</div>
                <div className="text-sm">Delivery Time</div>
              </div>
              <div className="text-center">
                <div className="font-bold">100%</div>
                <div className="text-sm">On-Time Guarantee</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;