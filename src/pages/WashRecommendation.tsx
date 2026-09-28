import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import PlanRecommendation from '../components/wash/PlanRecommendation';
import Footer from '../components/common/Footer';
import { Container, PageHero } from '../components/common/ui';
import SeoTags from '../seo/SeoTags';

const WashRecommendation: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper">
      <SeoTags route="/laundry/recommendation" />
      <Helmet>
        <meta name="keywords" content="laundry plan recommendation, subscription laundry Abuja, custom laundry service, Laundry by Jaranow" />
      </Helmet>

      <Header logo="laundry" ctaLabel="Schedule pickup" ctaTo="/laundry" />

      <main>
        <PageHero
          eyebrow="Laundry by Jaranow · Plan finder"
          title="Find the plan that fits."
          intro="Four quick questions about your week, and we'll point you to the option that fits how you actually live."
        />

        <section className="py-16 sm:py-24">
          <Container>
            <div className="mx-auto max-w-4xl">
              <PlanRecommendation showHeader={false} />
              <p className="mt-8 text-center text-ink/60">
                Rather see everything side by side?{' '}
                <Link to="/pricing?service=wash" className="font-medium text-primary-600 underline underline-offset-4">
                  Compare the plans
                </Link>
              </p>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WashRecommendation;
