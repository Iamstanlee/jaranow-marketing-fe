import React from 'react';
import {motion} from 'framer-motion';

interface LaunchBannerProps {
  onClaimOffer: () => void;
}

const LaunchBanner: React.FC<LaunchBannerProps> = ({onClaimOffer}) => {
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}/>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <span className="font-bold text-sm sm:text-base">
            ✨ LAUNCH SPECIAL ✨
          </span>
          <span className="text-sm sm:text-base">
            Never do laundry again. <span className="font-semibold">50% off your first month.</span> Limited spots available.
          </span>
          <motion.button
            onClick={onClaimOffer}
            className="bg-white text-primary-700 font-bold px-6 py-2 rounded-full text-sm hover:bg-gray-100 transition-colors duration-200 shadow-lg whitespace-nowrap"
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
          >
            CLAIM OFFER
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default LaunchBanner;