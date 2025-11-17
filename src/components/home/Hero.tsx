import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {ArrowRight, Zap, Sparkles, Carrot, Bike, Shirt} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Animated Blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-8">
            <Sparkles size={16} className="text-yellow-300" />
            <span className="text-sm font-medium">Convenience as a Service</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Everything You Need,{' '}
            <span className="text-yellow-300">Right When You Need It</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            From lightning-fast grocery delivery to premium laundry care — Jaranow brings convenience to your doorstep.
          </motion.p>

          {/* Dual CTAs */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to="/delivery"
              className="group w-full sm:w-auto px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Bike size={20} className="text-primary-600" />
              <span>10-Min Delivery</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/wash"
              className="group w-full sm:w-auto px-8 py-4 bg-primary-500/20 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Shirt size={20} />
              <span>Laundry Service</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">Trusted by 1000+ customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap size={20} className="text-yellow-300" />
              <span className="text-sm font-medium">Available in Abuja</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
