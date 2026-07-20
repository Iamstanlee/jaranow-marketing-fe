import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/common/Header';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import Footer from '../components/common/Footer';
import SeoTags from '../seo/SeoTags';

const Home: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SeoTags route="/" />
      <Helmet>
        <meta
          name="keywords"
          content="Jaranow, convenience service, car wash Abuja, car wash Gwarinpa, laundry service Abuja, subscription laundry, doorstep laundry pickup"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Jaranow',
            url: 'https://jaranow.com',
            logo: 'https://jaranow.com/jaranow/icon-512.png',
            description: 'Convenience as a Service platform offering hand car washing in Gwarinpa and subscription laundry across Abuja',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Abuja',
              addressCountry: 'NG',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+234-903-862-2012',
              contactType: 'Customer Service',
              availableLanguage: ['en', 'ig', 'yo', 'ha'],
            },
            sameAs: [
              'https://www.instagram.com/jara_now',
              'https://twitter.com/jara_now',
              'https://facebook.com/jaranow',
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Jaranow Services',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Carwash by Jaranow',
                    description: 'Hand car washing in Gwarinpa, Abuja. Drive in, we wash, you drive off.',
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
        <Header />
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
