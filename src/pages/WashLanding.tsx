import React from 'react';
import {Helmet} from 'react-helmet-async';

import Header from '../components/common/Header';
import Hero from '../components/wash/Hero';
import Benefits from '../components/wash/Benefits';
import HowItWorks from '../components/wash/HowItWorks';
import PricingPlans from '../components/wash/PricingPlans';
import PlanRecommendation from '../components/wash/PlanRecommendation';
import Testimonials from '../components/wash/Testimonials';
import FAQ from '../components/wash/FAQ';
import Footer from '../components/common/Footer';
import SeoTags from '../seo/SeoTags';
import {scrollToElement} from '../utils/formatters';
import {useLandingScroll} from '../utils/useLandingScroll';

const WashLanding: React.FC = () => {
  useLandingScroll();

  const scrollToPricing = () => {
    scrollToElement('pricing');
  };

  return (
    <div className="min-h-screen bg-paper">
      <SeoTags route="/laundry" />
      <Helmet>
        <meta name="keywords" content="laundry pickup Abuja, laundry delivery Abuja, laundry service Abuja, wash and fold Abuja, ironing service Abuja, laundry subscription Abuja, laundry Gwarinpa" />
        <link rel="icon" href="/wash/favicon.ico" />
        <link rel="apple-touch-icon" href="/wash/apple-touch-icon.png" />
        <link rel="manifest" href="/wash-manifest.json" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Laundry by Jaranow",
            "description": "Laundry pickup and delivery across Abuja. Collected from your door, washed, ironed and folded, and returned within 48 hours. Monthly plans or pay per item.",
            "url": "https://jaranow.com/laundry",
            "logo": "https://jaranow.com/wash/icon-512.png",
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
            "priceRange": "₦₦₦",
            "serviceArea": {
              "@type": "City",
              "name": "Abuja"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Laundry Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Lite Laundry Plan",
                    "description": "2 washes a month, up to 12 clothes each, collected Tuesday and Saturday"
                  },
                  "price": "14999",
                  "priceCurrency": "NGN",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Premium Laundry Plan",
                    "description": "3 washes a month, up to 15 clothes each, special items included, collected Tuesday, Thursday and Saturday"
                  },
                  "price": "24999",
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

      <Header logo="laundry" ctaLabel="Schedule pickup" onCtaClick={scrollToPricing} />

      <main>
        <Hero onSchedulePickup={scrollToPricing} onFindPlan={() => scrollToElement('plan-recommendation')} />

        <Benefits />

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <div id="plan-recommendation">
          <PlanRecommendation />
        </div>

        <PricingPlans />

        <Testimonials />

        <div id="faq">
          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WashLanding;