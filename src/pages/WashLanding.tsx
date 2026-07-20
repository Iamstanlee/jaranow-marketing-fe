import React, {useEffect} from 'react';
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

const WashLanding: React.FC = () => {
  useEffect(() => {
    // Scroll to element if hash is present in URL
    const hash = window.location.hash.substring(1); // Remove the '#' character
    if (hash) {
      setTimeout(() => {
        scrollToElement(hash);
      }, 100);
    }
  }, []);

  const scrollToPricing = () => {
    scrollToElement('pricing');
  };

  return (
    <div className="min-h-screen bg-white">
      <SeoTags route="/laundry" />
      <Helmet>
        <meta name="keywords" content="laundry service Abuja, subscription laundry, doorstep laundry pickup, premium laundry service, professional dry cleaning Abuja, laundry delivery service Nigeria" />
        <link rel="icon" href="/wash/favicon.ico" />
        <link rel="apple-touch-icon" href="/wash/apple-touch-icon.png" />
        <link rel="manifest" href="/wash-manifest.json" />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Laundry by Jaranow",
            "description": "Premium subscription-based laundry service with professional doorstep pickup and delivery in Abuja",
            "url": "https://jaranow.com/laundry",
            "logo": "https://jaranow.com/wash/icon-512.png",
            "telephone": "+234-903-862-2012",
            "email": "hello@jaranow.com",
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
            "openingHours": "Mo-Sa 08:00-18:00",
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
                    "description": "Essential laundry service with pickup and delivery"
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
                    "description": "Premium laundry service with delicate fabric care and stain treatment"
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
        <Hero onSchedulePickup={scrollToPricing} />

        <Benefits />

        <div id="how-it-works">
          <HowItWorks />
        </div>

        <div id="plan-recommendation">
          <PlanRecommendation />
        </div>

        <div id="pricing">
          <PricingPlans />
        </div>

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