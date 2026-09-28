import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/common/Header';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import Standard from '../components/home/Standard';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import ClosingCta from '../components/home/ClosingCta';
import Footer from '../components/common/Footer';
import SeoTags from '../seo/SeoTags';
import { useLandingScroll } from '../utils/useLandingScroll';

const Home: React.FC = () => {
  useLandingScroll();

  return (
    <>
      <SeoTags route="/" />
      <Helmet>
        <meta
          name="keywords"
          content="Jaranow, car wash Gwarinpa, car wash Abuja, laundry pickup Abuja, laundry delivery Abuja, laundry service Abuja, wash and fold Abuja"
        />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Jaranow',
            url: 'https://jaranow.com',
            logo: 'https://jaranow.com/jaranow/icon-512.png',
            description: 'Car wash in Gwarinpa and laundry pickup and delivery across Abuja.',
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
                    description: 'Car wash at 6th Avenue, Gwarinpa, Abuja. Drive in, we wash, you drive off.',
                  },
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Laundry by Jaranow',
                    description: 'Laundry collected from your door across Abuja, washed, ironed, folded and returned within 48 hours.',
                  },
                },
              ],
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-paper">
        <Header />
        <main>
          <Hero />
          <Standard />
          <Services />
          <Testimonials />
          <FAQ />
          <ClosingCta />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
