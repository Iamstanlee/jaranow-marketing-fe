import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/common/Header';
import PlanRecommendation from '../components/wash/PlanRecommendation';
import Footer from '../components/common/Footer';

const WashRecommendation: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Plan Recommendation - Find Your Perfect Laundry Plan | Laundry by Jaranow</title>
        <meta name="description" content="Answer a few quick questions and get a personalized laundry plan recommendation. Find the perfect subscription plan for your needs with Laundry by Jaranow." />
        <meta name="keywords" content="laundry plan recommendation, subscription laundry Abuja, best laundry plan, custom laundry service, Laundry by Jaranow pricing" />
        <link rel="canonical" href="https://jaranow.com/laundry/recommendation" />
        <meta property="og:title" content="Find Your Perfect Laundry Plan - Laundry by Jaranow" />
        <meta property="og:description" content="Get a personalized laundry plan recommendation based on your needs. Answer a few questions and find the best plan for you." />
        <meta property="og:image" content="/wash/opengraph.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaranow.com/laundry/recommendation" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jara_now" />
        <meta name="twitter:title" content="Find Your Perfect Laundry Plan - Laundry by Jaranow" />
        <meta name="twitter:description" content="Get a personalized laundry plan recommendation based on your needs." />
        <meta name="twitter:image" content="/wash/opengraph.png" />
      </Helmet>

      <Header logo="laundry" ctaLabel="Schedule pickup" ctaTo="/laundry" />

      {/* Hero band (blends with the fixed header) */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Find Your Perfect Plan</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Answer a few quick questions and we'll recommend the laundry plan that fits you best.
          </p>
        </div>
      </section>

      <main>
        <PlanRecommendation />
      </main>

      <Footer />
    </div>
  );
};

export default WashRecommendation;
