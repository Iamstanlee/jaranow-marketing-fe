import React from 'react';
import { Smartphone, CheckCircle, Truck, Sparkles } from 'lucide-react';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const HowItWorks: React.FC = () => {
  const steps: Step[] = [
    {
      icon: <Smartphone size={32} className="text-white" />,
      title: 'Choose Your Service',
      description: 'Select from our fixed-price car wash or premium laundry service based on your needs.',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: <CheckCircle size={32} className="text-white" />,
      title: 'Place Your Order',
      description: 'Book on WhatsApp or straight from this site. No app to download, no account to create.',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      icon: <Truck size={32} className="text-white" />,
      title: 'We Handle The Rest',
      description: 'We wash your car at 6th Avenue, or collect and return your laundry at home.',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: <Sparkles size={32} className="text-white" />,
      title: 'Pay A Fixed Price',
      description: 'The price you were quoted is the price you pay. No negotiation, no surprises.',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with Jaranow is simple and quick. Here's how we bring convenience to you.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Connector Line (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0"></div>
                  )}

                  {/* Step Card */}
                  <div className="relative z-10 text-center">
                    {/* Icon Container */}
                    <div className="relative inline-block mb-6">
                      <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300`}>
                        {step.icon}
                      </div>
                      {/* Step Number */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
              <a
                href="#services"
                className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Explore Services
              </a>
              <p className="text-gray-600">
                or{' '}
                <a
                  href="https://wa.me/2349038622012"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 font-semibold hover:underline"
                >
                  chat with us on WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
