import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Apple, Download } from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">Download Jaranow App</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* App Icon and Description */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Get Started with Jara AI
                </h4>
                <p className="text-gray-600 text-sm">
                  Experience the future of grocery shopping with voice ordering, camera intelligence, and 10-minute delivery.
                </p>
              </div>

              {/* Coming Soon Message */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">
                    App Coming Soon!
                  </h5>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We're putting the finishing touches on the Jaranow app. 
                    Join our waitlist to be the first to download and get exclusive early access benefits!
                  </p>
                </div>
              </div>

              {/* Early Access Benefits */}
              <div className="space-y-3 mb-6">
                <h6 className="font-semibold text-gray-900">Early Access Benefits:</h6>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">First 3 deliveries FREE</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">10% discount for first month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Priority support access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Beta access to new features</span>
                  </div>
                </div>
              </div>

              {/* Download Buttons (Placeholder) */}
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-semibold px-6 py-4 rounded-xl flex items-center justify-center space-x-3 cursor-not-allowed"
                >
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>

                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-semibold px-6 py-4 rounded-xl flex items-center justify-center space-x-3 cursor-not-allowed"
                >
                  <Download className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>

              {/* Join Waitlist CTA */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    // This would typically open a waitlist form or redirect
                    window.open('mailto:support@jaranow.com?subject=App%20Waitlist%20-%20Early%20Access', '_blank');
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Join App Waitlist - Get Notified
                </button>
              </div>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Want to start ordering now? Contact us directly:
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                  <a
                    href="tel:+2347048667650"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    📱 +234 903 862 2012
                  </a>
                  <a
                    href="mailto:support@jaranow.com"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    ✉️ support@jaranow.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppDownloadModal;