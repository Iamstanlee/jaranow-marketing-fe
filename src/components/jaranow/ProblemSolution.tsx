import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Camera, Zap, CheckCircle2, XCircle } from 'lucide-react';

const ProblemSolution: React.FC = () => {
  const problems = [
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Grocery shopping wastes 2-5 hours weekly"
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Long queues and crowded supermarkets"
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Typing long shopping lists is tedious"
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      text: "Delivery takes hours or even days"
    }
  ];

  const solutions = [
    {
      icon: <Mic className="w-8 h-8 text-[#ff0023]" />,
      title: "Voice Ordering",
      description: "Just speak naturally: 'Jara, I need rice, tomatoes, and cooking oil for tonight's dinner'",
      example: "🎤 'Jara, get me ingredients for jollof rice'"
    },
    {
      icon: <Camera className="w-8 h-8 text-[#ff0023]" />,
      title: "Camera Intelligence",
      description: "Take a photo of your shopping list, receipt, or empty containers - Jara understands it all",
      example: "📷 Photo of shopping list → Instant cart"
    },
    {
      icon: <Zap className="w-8 h-8 text-[#ff0023]" />,
      title: "10-Minute Delivery",
      description: "Guaranteed doorstep delivery in exactly 10 minutes. Professional shoppers handle everything",
      example: "⚡ Order placed → Delivered in 10 minutes"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Problem Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            The Problem with Traditional
            <span className="text-red-500"> Grocery Shopping</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-red-100 border border-red-200 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-center mb-3">
                  {problem.icon}
                </div>
                <p className="text-gray-700 text-sm">{problem.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Solution Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Meet <span className="text-[#ff0023]">Jara AI</span>
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Revolutionary AI that converts your voice, photos, or text into perfect shopping carts
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-red-200 shadow-lg"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    {solution.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {solution.title}
                </h3>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                
                <div className="bg-white rounded-lg p-4 border-l-4 border-[#ff0023]">
                  <p className="text-sm text-gray-600 font-medium">
                    {solution.example}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-[#ff0023] to-red-600 rounded-2xl p-8 text-white"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <CheckCircle2 className="w-8 h-8" />
              <h3 className="text-2xl font-bold">The Result</h3>
            </div>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              <strong>Save 2-5 hours weekly</strong>, skip the queues, and get exactly what you need
              delivered to your doorstep in just 10 minutes. Shopping has never been this easy!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;