import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, CheckCircle2, Calendar, Users } from 'lucide-react';

const ServiceAreas: React.FC = () => {
  const currentAreas = [
    {
      name: "Gwarinpa",
      status: "Live Now",
      description: "Full 10-minute delivery service",
      icon: <CheckCircle2 className="w-5 h-5 text-[#2563eb]" />,
      color: "bg-primary-100 border-primary-200 text-primary-800"
    }
  ];

  const comingSoon = [
    {
      name: "Asokoro",
      status: "Coming Soon",
      description: "Q1 2026 - Join waitlist",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100 border-blue-200 text-blue-800"
    },
    {
      name: "Maitama",
      status: "Coming Soon",
      description: "Q1 2026 - Join waitlist",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100 border-blue-200 text-blue-800"
    },
    {
      name: "Jahi",
      status: "Coming Soon",
      description: "Q1 2026 - Join waitlist",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100 border-blue-200 text-blue-800"
    },
    {
      name: "Life Camp",
      status: "Coming Soon", 
      description: "Q1 2026 - Join waitlist",
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100 border-blue-200 text-blue-800"
    }
  ];

  const futureCities = [
    {
      name: "Lagos",
      status: "2026",
      description: "Victoria Island, Ikoyi, Lekki",
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-100 border-purple-200 text-purple-800"
    },
    {
      name: "Port Harcourt",
      status: "2026",
      description: "GRA, Trans Amadi, Rumuokoro",
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-100 border-purple-200 text-purple-800"
    },
    {
      name: "Ibadan",
      status: "2026",
      description: "Bodija, Dugbe, Jericho",
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-100 border-purple-200 text-purple-800"
    }
  ];

  return (
    <section id="service-areas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Service Areas & <span className="text-[#2563eb]">Expansion</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Starting in Abuja, expanding across Nigeria's major cities
          </p>
        </motion.div>

        {/* Current Service Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center space-x-3">
            <MapPin className="w-6 h-6 text-[#2563eb]" />
            <span>Live Now in Abuja</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              {currentAreas.map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${area.color} rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {area.icon}
                    <h4 className="text-lg font-bold">{area.name}</h4>
                  </div>
                  <div className="text-sm font-semibold mb-2">{area.status}</div>
                  <p className="text-sm opacity-80">{area.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-[#2563eb] to-primary-700 rounded-2xl p-8 text-white h-full flex flex-col justify-center"
              >
                <h4 className="text-2xl font-bold mb-4">🎉 We're Live in Gwarinpa!</h4>
                <p className="text-blue-100 mb-6 text-lg">
                  Experience Nigeria's first 10-minute grocery delivery service. 
                  Order now and get your groceries delivered faster than ever before.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-sm text-blue-100">Minutes Delivery</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm text-blue-100">Service Available</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon in Abuja */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center space-x-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <span>Expanding in Abuja</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoon.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${area.color} rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300 text-center`}
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {area.icon}
                  <h4 className="text-lg font-bold">{area.name}</h4>
                </div>
                <div className="text-sm font-semibold mb-2">{area.status}</div>
                <p className="text-xs opacity-80">{area.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Future Cities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center space-x-3">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Expanding Nationwide</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {futureCities.map((city, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${city.color} rounded-xl p-6 border-2 hover:shadow-lg transition-all duration-300 text-center`}
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {city.icon}
                  <h4 className="text-xl font-bold">{city.name}</h4>
                </div>
                <div className="text-sm font-semibold mb-2">{city.status}</div>
                <p className="text-sm opacity-80">{city.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join Waitlist CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Want Jaranow in Your Area?
            </h4>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our waitlist and be the first to know when we launch in your neighborhood. 
              Plus, get exclusive early access and special launch offers!
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5000+</div>
                <div className="text-sm text-gray-600">People on waitlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">10%</div>
                <div className="text-sm text-gray-600">Early access discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2563eb]">FREE</div>
                <div className="text-sm text-gray-600">First 3 deliveries</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceAreas;