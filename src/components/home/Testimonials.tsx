import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../utils/animations';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  service: 'delivery' | 'laundry';
  avatar: string;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: 'Chioma Adebayo',
      role: 'Busy Professional',
      content: 'The 10-minute delivery is a game changer! I can order groceries while cooking and have them arrive before I even need them. Absolutely amazing service!',
      rating: 5,
      service: 'delivery',
      avatar: 'CA'
    },
    {
      name: 'David Okafor',
      role: 'Tech Entrepreneur',
      content: 'Jaranow Wash has saved me so much time. The subscription model is perfect for my busy lifestyle, and the quality is consistently excellent.',
      rating: 5,
      service: 'laundry',
      avatar: 'DO'
    },
    {
      name: 'Amina Mohammed',
      role: 'Working Mom',
      content: 'As a working mother, Jaranow has been a lifesaver. From quick grocery runs to laundry pickup, they handle it all so I can focus on what matters.',
      rating: 5,
      service: 'delivery',
      avatar: 'AM'
    },
    {
      name: 'Emeka Nwosu',
      role: 'Student',
      content: 'The voice ordering feature is brilliant! I can order groceries hands-free while studying. Plus the delivery is super fast.',
      rating: 5,
      service: 'delivery',
      avatar: 'EN'
    },
    {
      name: 'Blessing Eze',
      role: 'Consultant',
      content: 'I love that my clothes are picked up, washed, ironed, and delivered back to me. The premium laundry service is worth every naira!',
      rating: 5,
      service: 'laundry',
      avatar: 'BE'
    },
    {
      name: 'Tunde Bakare',
      role: 'Creative Director',
      content: 'Jaranow understands convenience. Whether it\'s groceries or laundry, they deliver exceptional service every single time.',
      rating: 5,
      service: 'delivery',
      avatar: 'TB'
    }
  ];

  const getServiceBadgeColor = (service: 'delivery' | 'laundry') => {
    return service === 'delivery'
      ? 'bg-primary-100 text-primary-700'
      : 'bg-blue-100 text-blue-700';
  };

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Section Header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Jaranow for their daily convenience needs.
            </p>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-gray-200">
                  <Quote size={32} fill="currentColor" />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>

                  {/* Service Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getServiceBadgeColor(testimonial.service)}`}>
                    {testimonial.service === 'delivery' ? 'Delivery' : 'Laundry'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">10min</div>
              <div className="text-gray-600">Avg. Delivery Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
