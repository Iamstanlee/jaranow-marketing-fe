import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/common/Header';
import PlanRecommendation from '../components/wash/PlanRecommendation';
import Footer from '../components/common/Footer';
import SeoTags from '../seo/SeoTags';

const WashRecommendation: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <SeoTags route="/laundry/recommendation" />
      <Helmet>
        <meta name="keywords" content="laundry plan recommendation, subscription laundry Abuja, custom laundry service, Laundry by Jaranow" />
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
