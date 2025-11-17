import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Truck, 
  Gem, 
  DollarSign, 
  Shield, 
  Smartphone 
} from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Get back 3-5 hours every week. Focus on what matters most while we handle your laundry.',
    stats: '3-5 hours saved weekly'
  },
  {
    icon: Truck,
    title: 'Doorstep Service',
    description: 'Free pickup and delivery right to your doorstep. Schedule at your convenience.',
    stats: 'Free pickup & delivery'
  },
  {
    icon: Gem,
    title: 'Premium Quality',
    description: 'Professional-grade machines, premium detergents, and expert care for your clothes.',
    stats: '99.9% customer satisfaction'
  },
  {
    icon: DollarSign,
    title: 'Cost Effective',
    description: 'Save money compared to traditional dry cleaning. No hidden fees, transparent pricing.',
    stats: 'Save up to 40% vs competitors'
  },
  {
    icon: Shield,
    title: 'Guaranteed Care',
    description: 'Damage protection, quality guarantee, and dedicated customer support.',
    stats: '100% money-back guarantee'
  },
  {
    icon: Smartphone,
    title: 'Easy Management',
    description: 'Track your orders, schedule pickups, and manage preferences through our mobile app.',
    stats: 'Real-time order tracking'
  }
];

const Benefits: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-bold">
            Why Choose <span className="text-primary-600">Jaranow?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            More than just laundry service - we're your time-saving, quality-focused partner 
            for a cleaner, more convenient lifestyle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6">
                  <IconComponent className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                <div className="text-sm font-semibold text-primary-600 bg-primary-50 rounded-lg px-3 py-2 inline-block">
                  {benefit.stats}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Experience the Difference?</h3>
            <p className="text-blue-100 mb-6">
              Join thousands of satisfied Nigerians who've made the smart switch to Jaranow.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">48hrs</div>
                <div className="text-blue-100 text-sm">Typical turnaround</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">5-Star</div>
                <div className="text-blue-100 text-sm">Average rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">24/7</div>
                <div className="text-blue-100 text-sm">Customer support</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;