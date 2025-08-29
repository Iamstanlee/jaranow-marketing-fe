import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import JaranowNavigation from '../components/jaranow/Navigation';
import JaranowHero from '../components/jaranow/Hero';
import ProblemSolution from '../components/jaranow/ProblemSolution';
import HowItWorks from '../components/jaranow/HowItWorks';
import ServiceAreas from '../components/jaranow/ServiceAreas';
import Pricing from '../components/jaranow/Pricing';
import TrustProof from '../components/jaranow/TrustProof';
import FAQ from '../components/jaranow/FAQ';
import JaranowFooter from '../components/jaranow/Footer';
// import AppDownloadModal from '../components/jaranow/AppDownloadModal';

const JaranowLanding: React.FC = () => {
  const handleOrderNow = () => {
    // Open WhatsApp with pre-filled message
    const phoneNumber = "2349038622012";
    const message = "Hi! I'd like to place an order for grocery delivery through Jaranow. Can you help me get started?";
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Jaranow - Nigeria's First 10-Minute Grocery Delivery</title>
        <meta name="description" content="Revolutionary AI-powered grocery delivery in 10 minutes. Order with voice, camera, or text. Starting in Abuja, expanding nationwide." />
        <link rel="icon" href="/jaranow/favicon.ico" />
        <link rel="apple-touch-icon" href="/jaranow/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="Jaranow - Nigeria's First 10-Minute Grocery Delivery" />
        <meta property="og:description" content="Revolutionary AI-powered grocery delivery in 10 minutes. Order with voice, camera, or text. Starting in Abuja, expanding nationwide." />
        <meta property="og:image" content="/jaranow/opengraph.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jaranow_app" />
        <meta name="twitter:image" content="/jaranow/opengraph.png" />
      </Helmet>
      
      <JaranowNavigation onOrderNow={handleOrderNow} />
      
      <main>
        <JaranowHero onOrderNow={handleOrderNow} />
        
        <ProblemSolution />
        
        <motion.div id="how-it-works">
          <HowItWorks />
        </motion.div>
        
        <ServiceAreas />
        
        <motion.div id="pricing">
          <Pricing />
        </motion.div>
        
        <TrustProof />
        
        <motion.div id="faq">
          <FAQ />
        </motion.div>
      </main>

      <JaranowFooter onOrderNow={handleOrderNow} />
    </div>
  );
};

export default JaranowLanding;