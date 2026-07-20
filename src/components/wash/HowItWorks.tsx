import React from 'react';
import {motion} from 'framer-motion';

const steps = [
  {
    step: 1,
    title: 'Schedule Pickup',
    description: 'Pick a slot on WhatsApp or here on the site. Lite plans collect twice a week, Premium three times.',
    icon: '📅',
    details: ['Tuesday & Saturday pickups', 'Thursdays on Premium', '48-hour turnaround']
  },
  {
    step: 2,
    title: 'We Collect & Clean',
    description: 'Our trained professionals collect your clothes and take them to our premium facilities for expert cleaning.',
    icon: '🧺',
    details: ['Professional-grade machines', 'Premium detergents', 'Expert stain treatment']
  },
  {
    step: 3,
    title: 'Quality Check & Delivery',
    description: 'Every item is quality-checked, perfectly folded, and delivered back to your doorstep fresh and clean.',
    icon: '✨',
    details: ['Quality inspection', 'Perfect folding']
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-bold">
            How <span className="text-primary-600">Jaranow</span> Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, convenient, and reliable. Get your laundry done in 3 easy steps 
            without leaving your home.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-300"></div>
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 items-stretch">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center flex flex-col">
                {/* Step Number Circle */}
                <motion.div 
                  className="relative mx-auto w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                  {/* Pulse animation */}
                  <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20"></div>
                </motion.div>

                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex-1 flex flex-col">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-grow">{step.description}</p>

                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center justify-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🕐 Typical Timeline
            </h3>
            <div className="flex justify-center items-center space-x-4 text-gray-600">
              <div className="text-center">
                <div className="font-semibold">Day 1</div>
                <div className="text-sm">Pickup</div>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="text-center">
                <div className="font-semibold">Day 2 and 3</div>
                <div className="text-sm">Processing</div>
              </div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="text-center">
                <div className="font-semibold text-primary-600">Day 4</div>
                <div className="text-sm text-primary-600">Fresh & Clean!</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              *Express service available for premium subscribers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;