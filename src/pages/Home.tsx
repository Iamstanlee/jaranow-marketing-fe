import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../components/home/Navigation';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import Footer from '../components/home/Footer';

const Home: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Jaranow - Convenience as a Service | 10-Min Delivery & Laundry</title>
        <meta
          name="description"
          content="Jaranow brings convenience to your doorstep with 10-minute grocery delivery and premium laundry service in Abuja. Experience hassle-free living today."
        />
        <meta
          name="keywords"
          content="Jaranow, convenience service, grocery delivery, laundry service, Abuja, 10 minute delivery, quick delivery, premium laundry, doorstep delivery"
        />
        <link rel="canonical" href="https://jaranow.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaranow.com" />
        <meta property="og:title" content="Jaranow - Convenience as a Service" />
        <meta
          property="og:description"
          content="From lightning-fast grocery delivery to premium laundry care — Jaranow brings convenience to your doorstep in Abuja."
        />
        <meta property="og:site_name" content="Jaranow" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://jaranow.com" />
        <meta name="twitter:title" content="Jaranow - Convenience as a Service" />
        <meta
          name="twitter:description"
          content="From lightning-fast grocery delivery to premium laundry care — Jaranow brings convenience to your doorstep in Abuja."
        />
        <meta name="twitter:site" content="@jaranow" />
        <meta name="twitter:creator" content="@jaranow" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Jaranow',
            url: 'https://jaranow.com',
            logo: 'https://jaranow.com/logo.png',
            description: 'Convenience as a Service platform offering 10-minute delivery and premium laundry services',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Abuja',
              addressCountry: 'NG',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+234-816-260-5753',
              contactType: 'Customer Service',
              availableLanguage: ['en', 'ig', 'yo', 'ha'],
            },
            sameAs: [
              'https://www.instagram.com/jaranow',
              'https://www.linkedin.com/company/jaranow',
              'https://twitter.com/jaranow',
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Jaranow Services',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: '10-Minute Grocery Delivery',
                    description: 'Lightning-fast grocery delivery in 10 minutes or less',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Premium Laundry Service',
                    description: 'Subscription-based laundry service with doorstep pickup and delivery',
                  },
                },
              ],
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        <Navigation />
        <Hero />
        <Services />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <Footer />
      </div>
    </>
  );
};

export default Home;
