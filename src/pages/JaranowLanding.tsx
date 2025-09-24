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
        <title>Jaranow - Nigeria's First 10-Minute Grocery Delivery Service in Abuja | AI-Powered Shopping</title>
        <meta name="description" content="Get groceries delivered in 10 minutes! Jaranow offers AI-powered voice ordering, camera shopping, and ultra-fast delivery in Abuja. Order via WhatsApp. Starting in Gwarinpa, expanding to Lagos, PHC & Ibadan." />
        <meta name="keywords" content="grocery delivery Abuja, 10-minute delivery Nigeria, AI grocery shopping, voice ordering, grocery delivery Gwarinpa, fast delivery service Nigeria" />
        <link rel="canonical" href="https://jaranow.com/" />
        <link rel="icon" href="/jaranow/favicon.ico" />
        <link rel="apple-touch-icon" href="/jaranow/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:title" content="Jaranow - Nigeria's First 10-Minute Grocery Delivery" />
        <meta property="og:description" content="Revolutionary AI-powered grocery delivery in 10 minutes. Order with voice, camera, or text. Starting in Abuja, expanding nationwide." />
        <meta property="og:image" content="/jaranow/opengraph.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaranow.com/" />
        <meta property="og:site_name" content="Jaranow" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jara_now" />
        <meta name="twitter:title" content="Jaranow - Nigeria's First 10-Minute Grocery Delivery" />
        <meta name="twitter:description" content="Revolutionary AI-powered grocery delivery in 10 minutes. Order with voice, camera, or text. Starting in Abuja, expanding nationwide." />
        <meta name="twitter:image" content="/jaranow/opengraph.png" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Jaranow",
            "description": "Nigeria's first 10-minute grocery delivery service with AI-powered voice ordering and camera shopping",
            "url": "https://jaranow.com",
            "logo": "https://jaranow.com/jaranow/icon-512.png",
            "telephone": "+234-903-862-2012",
            "email": "support@jaranow.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Abuja",
              "addressRegion": "FCT",
              "addressCountry": "Nigeria"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 9.0579,
              "longitude": 7.4951
            },
            "openingHours": "Mo-Su 00:00-23:59",
            "priceRange": "₦₦",
            "serviceArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": 9.0579,
                "longitude": 7.4951
              },
              "geoRadius": 15000
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Grocery Delivery Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "10-Minute Grocery Delivery",
                    "description": "AI-powered grocery delivery service with voice ordering and camera shopping"
                  },
                  "price": "1500",
                  "priceCurrency": "NGN",
                  "availability": "https://schema.org/InStock"
                }
              ]
            },
            "sameAs": [
              "https://twitter.com/jara_now",
              "https://facebook.com/jaranow",
              "https://instagram.com/jara_now"
            ]
          })}
        </script>
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