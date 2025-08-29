import React, { useState } from 'react';
import { motion } from 'framer-motion';

import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import PricingPlans from './components/PricingPlans';
// import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import WaitlistForm from './components/WaitlistForm';
import Testimonials from "./components/Testimonials";

function App() {
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
}

export default App;
