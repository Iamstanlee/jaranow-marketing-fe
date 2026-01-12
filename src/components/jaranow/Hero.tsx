import React from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Camera,
  Clock,
  Smartphone,
  MapPin,
  MessageCircle
} from 'lucide-react';

interface HeroProps {
  onOrderNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderNow }) => {
  return (
    <section className="pt-20 bg-gradient-to-br from-red-100 via-pink-100 to-orange-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-900 leading-tight font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Nigeria's First
              <br />
              <span className="text-[#ff0023]">10-Minute</span> Grocery
              <br />
              <span className="text-[#ff0023]">Delivery</span>
            </motion.h1>
            
            <motion.p
              className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-700 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Revolutionary AI-powered shopping with <strong>voice ordering</strong>, <strong>camera intelligence</strong>, 
              and ultra-fast delivery. Just tell Jara what you need!
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5 text-[#ff0023]" />
                <span>"Jara, I need rice and tomatoes"</span>
              </div>
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#ff0023]" />
                <span>Photo → Shopping Cart</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-[#ff0023]" />
                <span>Paste Shopping List</span>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.button
                onClick={onOrderNow}
                className="w-full sm:w-auto bg-[#ff0023] hover:bg-[#e6001f] text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Smartphone className="w-6 h-6" />
                <span>Order Now - WhatsApp</span>
              </motion.button>
              
              <div className="text-center text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#ff0023]" />
                  <span className="font-semibold">Starting in Abuja</span>
                </div>
                <div className="text-sm">Expanding to Lagos, PHC & Ibadan</div>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-8 border-t border-[#ff0023]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-6 h-6 text-[#ff0023]" />
                  <div className="text-3xl sm:text-4xl font-bold text-[#ff0023]">10</div>
                </div>
                <div className="text-gray-700">Minutes Guaranteed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#ff0023] mb-2">AI</div>
                <div className="text-gray-700">Voice + Camera Shopping</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#ff0023] mb-2">₦1,500</div>
                <div className="text-gray-700">Total Service + Delivery</div>
              </div>
            </motion.div>

            <motion.div
              className="mt-16 relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-[#ff0023] via-red-500 to-pink-500 rounded-2xl h-64 sm:h-80 lg:h-96 flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <p className="text-lg font-semibold">Jaranow App Demo (Coming soon)</p>
                  <p className="text-sm opacity-80">Voice, Camera & Text Shopping</p>
                </div>
              </div>
              
              <motion.div
                className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-3"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Mic className="w-6 h-6 text-[#ff0023]" />
              </motion.div>
              
              <motion.div 
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Camera className="w-6 h-6 text-[#ff0023]" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Clock className="w-6 h-6 text-[#ff0023]" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;