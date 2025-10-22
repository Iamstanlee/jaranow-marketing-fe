import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Smartphone, ChevronDown } from 'lucide-react';

interface NavigationProps {
  onOrderNow: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onOrderNow }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const navItems = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ];

  const products = [
    { href: '/', label: 'Grocery Delivery', description: '10-minute AI-powered delivery' },
    { href: '/wash', label: 'Wash Service', description: 'Premium laundry subscription' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <img src="/logo-brand.png" alt="Jaranow - AI-powered grocery delivery" className="h-14 p-2"/>
            <span className="text-[10px] bg-[#ff0023]/10 text-[#ff0023] px-2 py-1 rounded-full">
              10-MIN DELIVERY
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button
                onMouseEnter={() => setIsProductsOpen(true)}
                onMouseLeave={() => setIsProductsOpen(false)}
                className="flex items-center space-x-1 text-gray-700 hover:bg-[#e6001f] hover:text-white transition-colors duration-200"
              >
                <span>Products</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    onMouseEnter={() => setIsProductsOpen(true)}
                    onMouseLeave={() => setIsProductsOpen(false)}
                  >
                    {products.map((product) => (
                      <a
                        key={product.href}
                        href={product.href}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="font-semibold text-gray-900 mb-1">
                          {product.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {product.description}
                        </div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:bg-[#e6001f] hover:text-white transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
            <motion.button
              onClick={onOrderNow}
              className="bg-[#ff0023] hover:bg-[#e6001f] text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smartphone className="w-4 h-4" />
              <span>Order Now</span>
            </motion.button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:bg-[#e6001f] hover:text-white transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-gray-100"
          >
            <div className="flex flex-col space-y-4">
              <div className="px-2">
                <div className="font-semibold text-gray-900 mb-2">Products</div>
                {products.map((product) => (
                  <a
                    key={product.href}
                    href={product.href}
                    className="block py-2 pl-4 pr-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="font-medium text-gray-900 text-sm">
                      {product.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {product.description}
                    </div>
                  </a>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="block text-gray-700 hover:bg-[#e6001f] hover:text-white transition-colors duration-200 px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <button
                onClick={() => {
                  onOrderNow();
                  setIsOpen(false);
                }}
                className="bg-[#ff0023] hover:bg-[#e6001f] text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Order Now</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;