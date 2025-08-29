import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import Navigation from '../components/wash/Navigation';
import Hero from '../components/wash/Hero';
import Benefits from '../components/wash/Benefits';
import HowItWorks from '../components/wash/HowItWorks';
import PricingPlans from '../components/wash/PricingPlans';
import Testimonials from '../components/wash/Testimonials';
import FAQ from '../components/wash/FAQ';
import Footer from '../components/wash/Footer';
import WaitlistForm from '../components/wash/WaitlistForm';

const WashLanding: React.FC = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();

  const openWaitlist = (planId?: string) => {
    setSelectedPlan(planId);
    setIsWaitlistOpen(true);
  };

  const closeWaitlist = () => {
    setIsWaitlistOpen(false);
    setSelectedPlan(undefined);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Jaranow Wash - Premium Laundry Service in Abuja</title>
        <meta name="description" content="Premium subscription-based laundry service with doorstep pickup and delivery. Professional cleaning, perfect folding, all at your convenience in Abuja." />
        <link rel="icon" href="/wash/favicon.ico" />
        <link rel="apple-touch-icon" href="/wash/apple-touch-icon.png" />
        <link rel="manifest" href="/wash-manifest.json" />
        <meta property="og:title" content="Jaranow Wash - Premium Laundry Service in Abuja" />
        <meta property="og:description" content="Premium subscription-based laundry service with doorstep pickup and delivery. Professional cleaning, perfect folding, all at your convenience in Abuja." />
        <meta property="og:image" content="/wash/opengraph.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jaranow_wash" />
        <meta name="twitter:image" content="/wash/opengraph.png" />
      </Helmet>
      
      <Navigation onJoinWaitlist={() => openWaitlist()} />
      
      <main>
        <Hero onJoinWaitlist={() => openWaitlist()} />
        
        <Benefits />
        
        <motion.div id="how-it-works">
          <HowItWorks />
        </motion.div>
        
        <motion.div id="pricing">
          <PricingPlans onSelectPlan={(planId) => openWaitlist(planId)} />
        </motion.div>
        
        <Testimonials />
        
        <motion.div id="faq">
          <FAQ />
        </motion.div>
      </main>

      <Footer onJoinWaitlist={() => openWaitlist()} />

      <WaitlistForm
        isOpen={isWaitlistOpen}
        onClose={closeWaitlist}
        selectedPlan={selectedPlan}
      />
    </div>
  );
};

export default WashLanding;