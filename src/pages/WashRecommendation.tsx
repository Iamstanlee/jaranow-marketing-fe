import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from '../components/wash/Navigation';
import PlanRecommendation from '../components/wash/PlanRecommendation';
import Footer from '../components/wash/Footer';

const WashRecommendation: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Plan Recommendation - Find Your Perfect Laundry Plan | Jaranow wash</title>
        <meta name="description" content="Answer a few quick questions and get a personalized laundry plan recommendation. Find the perfect subscription plan for your needs with Jaranow wash." />
        <meta name="keywords" content="laundry plan recommendation, subscription laundry Abuja, best laundry plan, custom laundry service, Jaranow wash pricing" />
        <link rel="canonical" href="https://jaranow.com/wash/recommendation" />
        <meta property="og:title" content="Find Your Perfect Laundry Plan - Jaranow wash" />
        <meta property="og:description" content="Get a personalized laundry plan recommendation based on your needs. Answer a few questions and find the best plan for you." />
        <meta property="og:image" content="/wash/opengraph.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jaranow.com/wash/recommendation" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@jara_now" />
        <meta name="twitter:title" content="Find Your Perfect Laundry Plan - Jaranow wash" />
        <meta name="twitter:description" content="Get a personalized laundry plan recommendation based on your needs." />
        <meta name="twitter:image" content="/wash/opengraph.png" />
      </Helmet>

      <Navigation />

      <main className="pt-20">
        <PlanRecommendation />
      </main>

      <Footer />
    </div>
  );
};

export default WashRecommendation;
