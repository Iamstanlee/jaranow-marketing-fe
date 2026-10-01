import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, Car, Clock, MapPin, Shirt } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PlanRecommendation from '../components/wash/PlanRecommendation';
import { MoreCarwashPrices, WashOption, WashOptionCard } from '../components/carwash/Pricing';
import {
  CUSTOM_PRICING_MESSAGE,
  CustomPricingCard,
  LAUNDRY_PLANS,
  PlanCard,
  planWhatsAppMessage,
} from '../components/wash/PricingPlans';
import { Container, PageHero, SectionHeader, openWhatsApp } from '../components/common/ui';
import { trackLead } from '../utils/metaPixel';
import SeoTags from '../seo/SeoTags';

type ServiceTab = 'carwash' | 'wash';

// One of the five places the carwash services must stay in step (see CLAUDE.md).
const carwashOptions: WashOption[] = [
  {
    name: 'Exterior Wash',
    price: '₦2,000',
    tagline: 'For when the outside needs its shine back.',
    includes: [
      'Full exterior wash',
      'Wheels & tyres cleaned',
      'Windows & mirrors wiped down',
      'Dried and finished properly',
    ],
  },
  {
    name: 'Full Wash',
    price: '₦3,000',
    tagline: 'Inside and out, cleaned properly.',
    includes: [
      'Everything in the Exterior Wash',
      'Interior vacuum & wipe down',
      'Dashboard & console cleaned',
      'Mats cleaned and refreshed',
    ],
    featured: true,
  },
  {
    name: 'Vacuum Wash',
    price: '₦4,000',
    tagline: 'The full exterior wash, plus a deep machine vacuum inside.',
    includes: [
      'Full exterior wash',
      'Interior machine-vacuumed throughout',
      'Seats, carpets & boot cleaned out',
      'Dashboard & console wiped down',
    ],
  },
];

const carwashNotes = [
  { icon: <MapPin size={18} />, title: 'Where', body: '6th Avenue, Gwarinpa, Abuja' },
  { icon: <Clock size={18} />, title: 'When', body: 'Open every day, 8am–7pm' },
  { icon: <CalendarCheck size={18} />, title: 'Booking', body: 'Book a time on WhatsApp' },
];

const tabs: Array<{ id: ServiceTab; label: string; icon: React.ReactNode }> = [
  { id: 'carwash', label: 'Car wash', icon: <Car size={18} /> },
  { id: 'wash', label: 'Laundry', icon: <Shirt size={18} /> },
];

const Pricing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceParam = searchParams.get('service');
  const [activeTab, setActiveTab] = useState<ServiceTab>(
    serviceParam === 'wash' ? 'wash' : 'carwash'
  );

  useEffect(() => {
    const service = searchParams.get('service');
    if (service === 'wash') {
      setActiveTab('wash');
    } else if (service === 'carwash' || service === 'delivery') {
      // `delivery` is a legacy value kept working as a redirect to carwash.
      setActiveTab('carwash');
    }
  }, [searchParams]);

  const handleCarwashBook = (washType?: string) => {
    const chosen = washType ? `\nWash type: ${washType}` : '';
    openWhatsApp(`Hi Jaranow! I'd like to book a car wash at 6th Avenue, Gwarinpa, Abuja.${chosen}\n\nCan you help me get started?`);
  };

  const handleTabChange = (tab: ServiceTab) => {
    setActiveTab(tab);
    setSearchParams({ service: tab });
  };

  return (
    <div className="min-h-screen bg-paper">
      <SeoTags route="/pricing" />
      <Helmet>
        <meta name="keywords" content="Jaranow pricing, car wash cost Abuja, laundry service prices Nigeria, car wash Gwarinpa" />
      </Helmet>

      {activeTab === 'carwash' ? (
        <Header ctaLabel="Book a wash" onCtaClick={() => handleCarwashBook()} />
      ) : (
        <Header ctaLabel="Schedule pickup" ctaTo="/laundry#pricing" />
      )}

      <main>
        <PageHero
          eyebrow="Car wash & laundry prices in Abuja"
          title="What it costs."
          intro="Every car wash and laundry price in one place, so you can pick what suits you and get on with your day."
        >
          <div role="tablist" aria-label="Service" className="mt-10 inline-flex rounded-full border border-paper/15 bg-white/[0.04] p-1.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors ${
                    active ? 'bg-paper text-ink' : 'text-paper/70 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </PageHero>

        {activeTab === 'carwash' && (
          <section id="panel-carwash" role="tabpanel" className="py-16 sm:py-24">
            <Container>
              <SectionHeader
                eyebrow="Carwash by Jaranow"
                title="Three washes. One standard."
                intro="Car washes at 6th Avenue, Gwarinpa. Whichever you choose, you drive off in a clean, fresh car."
                className="max-w-2xl"
              />

              {/* Three cards: one column until lg, then three across. A 2-column
                  grid dangles the third card on its own row. */}
              <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {carwashOptions.map((option) => (
                  <WashOptionCard key={option.name} option={option} onBook={() => {
                    trackLead(`Price card - ${option.name}`);
                    handleCarwashBook(option.name);
                  }} />
                ))}
              </div>

              <MoreCarwashPrices />

              <dl className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
                {carwashNotes.map((note) => (
                  <div key={note.title} className="bg-white p-6">
                    <dt className="flex items-center gap-2 text-sm font-medium text-ink">
                      <span className="text-primary-600">{note.icon}</span>
                      {note.title}
                    </dt>
                    <dd className="mt-2 leading-relaxed text-ink/65">{note.body}</dd>
                  </div>
                ))}
              </dl>
            </Container>
          </section>
        )}

        {activeTab === 'wash' && (
          <section id="panel-wash" role="tabpanel" className="py-16 sm:py-24">
            <Container>
              <SectionHeader
                eyebrow="Laundry by Jaranow"
                title="Two plans, or pay per item."
                intro="Collected from your door, washed, ironed and folded, and back within 48 hours of pickup."
                className="max-w-2xl"
              />

              <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2">
                {LAUNDRY_PLANS.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onSelect={() => openWhatsApp(planWhatsAppMessage(plan))} />
                ))}
              </div>

              <div className="mt-6">
                <CustomPricingCard onSelect={() => openWhatsApp(CUSTOM_PRICING_MESSAGE)} />
              </div>

              <div className="mt-20 grid gap-12 lg:grid-cols-12">
                <SectionHeader
                  className="lg:col-span-4"
                  eyebrow="Plan finder"
                  title="Not sure which?"
                  intro="Four quick questions and we'll point you to the option that fits."
                />
                <div className="lg:col-span-8">
                  <PlanRecommendation showHeader={false} />
                </div>
              </div>
            </Container>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
