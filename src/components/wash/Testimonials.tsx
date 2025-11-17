import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: '1',
    name: 'Adebayo Johnson',
    location: 'Gwarinpa, Abuja',
    message: "Jaranow has completely transformed my weekly routine. As a busy executive, I no longer waste weekends doing laundry. The quality is exceptional and pickup is always on time.",
    rating: 5,
    avatar: 'AJ'
  },
  {
    id: '2',
    name: 'Sarah Ogunleye',
    location: 'Gwarinpa, Abuja',
    message: "I was skeptical about laundry services, but Jaranow exceeded my expectations. My clothes come back cleaner than I could ever achieve at home, and the folding is perfect!",
    rating: 5,
    avatar: 'SO'
  },
  {
    id: '3',
    name: 'Anonymous',
    location: 'Maitama, Abuja',
    message: "The convenience is unmatched. I just schedule pickups through the app and my laundry is handled professionally. Worth every naira for the time I save with my family.",
    rating: 5,
    avatar: 'AN'
  }
];

const trustBadges = [
  { icon: '🛡️', text: 'Insured Service' },
  { icon: '⭐', text: '4.9/5 Rating' },
  { icon: '🚀', text: '500+ Orders' },
  { icon: '💰', text: 'Money Back Guarantee' }
];

const Testimonials: React.FC = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 sm:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-bold">
            What Our <span className="text-primary-600">Customers Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who've made Jaranow their trusted laundry partner.
          </p>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center bg-white rounded-full px-6 py-3 shadow-md">
              <span className="text-2xl mr-2">{badge.icon}</span>
              <span className="font-semibold text-gray-800">{badge.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-primary-600">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>

              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.message}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Trusted by Busy Nigerians in Abuja
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">70+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Orders Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">On-Time Delivery</div>
            </div>
          </div>
        </motion.div>

        {/* Quote Section */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
            <div className="text-4xl mb-4">💬</div>
            <blockquote className="text-xl sm:text-2xl font-medium mb-4">
              "Jaranow isn't just a service, it's a lifestyle upgrade.
              Professional, reliable, and truly convenient."
            </blockquote>
            <cite className="text-blue-100">
              — Funmi Adebayo, Abuja Business Owner
            </cite>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;