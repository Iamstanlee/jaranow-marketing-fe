import React from 'react';
import {Check} from 'lucide-react';
import {SubscriptionPlan} from '../../types';
import {formatCurrency} from '../../utils/formatters';
import {btn, Container, Lift, SectionHeader, openWhatsApp} from '../common/ui';
import {trackLead} from '../../utils/metaPixel';

// Features are limited to what is confirmed. Lite pickup days were listed here as
// Tuesday & Thursday; the confirmed days are Tuesday & Saturday (Thursday is Premium's third).
export const LAUNDRY_PLANS: SubscriptionPlan[] = [
  {
    id: 'lite',
    name: 'Lite Plan',
    price: 14999,
    currency: '₦',
    washCount: 2,
    maxClothes: 12,
    features: [
      '2 washes a month',
      'Up to 12 clothes per wash',
      'Washed, dried, ironed and folded',
      'Pickup and delivery on Tuesday & Saturday',
      'Back within 48 hours of pickup',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 24999,
    currency: '₦',
    washCount: 3,
    maxClothes: 15,
    isPopular: true,
    features: [
      '3 washes a month',
      'Up to 15 clothes per wash',
      'Washed, dried, ironed and folded',
      'Special items included - suits, long dresses, towels, duvet sets, curtains',
      'Pickup and delivery on Tuesday, Thursday & Saturday',
      'Back within 48 hours of pickup',
    ],
  },
];

export const planWhatsAppMessage = (plan: SubscriptionPlan) =>
  `Hi Jaranow! I'm interested in scheduling laundry pickup for the _${plan.name}_ (₦${plan.price.toLocaleString()}/month).

${plan.name} Details:
• ${plan.features.join('\n• ')}

I'd like to get started. When is the next available pickup?`;

export const CUSTOM_PRICING_MESSAGE = `Hi Jaranow! I'm interested in scheduling laundry pickup for the _Custom Pricing Plan_.

Custom Plan Details:
• Pay per item - no monthly plan
• ₦700 per regular item (shirts, trousers, dresses, skirts, tops)
• ₦2,000 per special item (suits, long dresses, towels, duvet sets, curtains)
• Washed, ironed and folded

I'd like to get started. When is the next available pickup?`;

/** A monthly plan. The featured plan is set on Ink rather than badged. */
export const PlanCard: React.FC<{ plan: SubscriptionPlan; onSelect: () => void }> = ({ plan, onSelect }) => {
  const dark = plan.isPopular;
  return (
    <Lift className="h-full">
      <article className={`flex h-full flex-col rounded-3xl p-8 sm:p-10 ${dark ? 'bg-ink text-white' : 'border border-ink/10 bg-white'}`}>
        <h3 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{plan.name}</h3>
        <p className={`mt-2 ${dark ? 'text-paper/65' : 'text-ink/60'}`}>
          {plan.washCount} washes · up to {plan.maxClothes} clothes each
        </p>

        <p className="mt-8 flex items-baseline gap-2">
          <span className={`text-5xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
            {formatCurrency(plan.price)}
          </span>
          <span className={dark ? 'text-paper/55' : 'text-ink/50'}>per month</span>
        </p>

        <ul className={`mt-8 flex-1 space-y-3 border-t pt-8 ${dark ? 'border-paper/10' : 'border-ink/10'}`}>
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check size={18} className={`mt-0.5 flex-shrink-0 ${dark ? 'text-primary-400' : 'text-primary-600'}`} />
              <span className={dark ? 'text-paper/85' : 'text-ink/75'}>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => {
            trackLead(`Price card - ${plan.name}`);
            onSelect();
          }}
          className={`mt-10 w-full ${dark ? btn.primary : btn.ink}`}
        >
          Start the {plan.name}
        </button>
      </article>
    </Lift>
  );
};

/** Pay-per-item pricing, for anyone who does not need a monthly plan. */
export const CustomPricingCard: React.FC<{ onSelect: () => void }> = ({ onSelect }) => (
  <article className="grid gap-8 rounded-3xl border border-ink/10 bg-white p-8 sm:p-10 lg:grid-cols-12 lg:items-center">
    <div className="lg:col-span-5">
      <h3 className="text-2xl font-bold tracking-tight text-ink">Pay per item</h3>
      <p className="mt-2 max-w-sm leading-relaxed text-ink/60">
        No monthly plan. Collected, washed, ironed and folded, and you pay for what you send.
      </p>
    </div>
    <dl className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:col-span-7">
      {[
        { price: 700, label: 'Regular items', detail: 'Shirts, trousers, dresses, skirts, tops' },
        { price: 2000, label: 'Special items', detail: 'Suits, long dresses, towels, duvet sets, curtains' },
      ].map((row) => (
        <div key={row.label} className="bg-paper p-6">
          <dt className="text-sm font-medium text-ink">{row.label}</dt>
          <dd className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-ink">{formatCurrency(row.price)}</span>
            <span className="ml-1.5 text-ink/50">per item</span>
          </dd>
          <dd className="mt-2 text-sm leading-relaxed text-ink/55">{row.detail}</dd>
        </div>
      ))}
    </dl>
    <div className="lg:col-span-12">
      <button
        onClick={() => {
          trackLead('Price card - Laundry pay per item');
          onSelect();
        }}
        className={`${btn.ghostOnLight} w-full sm:w-auto`}
      >
        Arrange a pay-per-item pickup
      </button>
    </div>
  </article>
);

const PricingPlans: React.FC = () => {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow="Laundry plans & prices"
          title="Pick your rhythm."
          intro="Two monthly plans built around your pickup days. If you only need us now and then, pay per item instead."
          className="max-w-2xl"
        />

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2">
          {LAUNDRY_PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={() => openWhatsApp(planWhatsAppMessage(plan))} />
          ))}
        </div>

        <div className="mt-6">
          <CustomPricingCard onSelect={() => openWhatsApp(CUSTOM_PRICING_MESSAGE)} />
        </div>
      </Container>
    </section>
  );
};

export default PricingPlans;
