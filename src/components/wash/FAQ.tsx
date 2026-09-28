import React from 'react';
import {Container, FaqItem, FaqList, SectionHeader, btn, whatsappUrl} from '../common/ui';

// Answers are limited to what is confirmed. Removed: the 100% satisfaction /
// refund guarantee, "fully insured", item tagging and photos, the 2-hour and
// 30-minute follow-up promises, phone hours, and 24/7 support.
const faqs: FaqItem[] = [
  {
    question: 'Which days do you collect laundry?',
    answer: 'Lite plans are collected on Tuesday and Saturday. Premium adds Thursday. We confirm on WhatsApp before we come.',
  },
  {
    question: 'How long does laundry take?',
    answer: 'Everything is back at your door within 48 hours of pickup.',
  },
  {
    question: 'Is ironing and folding included?',
    answer: 'Yes. Every item is washed, dried, ironed and folded, so it comes back fresh and ready to wear.',
  },
  {
    question: 'Which parts of Abuja do you cover?',
    answer: 'We collect and deliver across Abuja. Send us your address on WhatsApp and we will confirm your pickup.',
  },
  {
    question: 'Can I pay per item instead of a monthly plan?',
    answer: 'Yes. Regular items such as shirts, trousers, dresses, skirts and tops are ₦700 each; special items are ₦2,000 each.',
  },
  {
    question: 'What counts as a special item?',
    answer: 'Suits, long dresses, towels, duvet sets and curtains. They are included on the Premium Plan.',
  },
  {
    question: 'Do I need to be home for pickup?',
    answer: 'Not necessarily. Tell us who we can collect from and hand back to - security, a neighbour - and we will confirm it with you.',
  },
  {
    question: 'Can I change my plan or pickup days?',
    answer: 'Message us on WhatsApp and we will sort it out with you, whether that is switching between Lite and Premium or moving a pickup.',
  },
  {
    question: 'What if something is not right?',
    answer: 'Tell us on WhatsApp at +234 903 862 2012 or email support@jaranow.com. We will look at it with you and put it right.',
  },
];

const FAQ: React.FC = () => {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader eyebrow="Questions" title="Good to know." intro="Anything not covered here, ask us - a real person reads every message." />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={btn.ink}>
              WhatsApp us
            </a>
            <a href="mailto:support@jaranow.com" className={btn.ghostOnLight}>
              Email support
            </a>
          </div>
        </div>
        <FaqList items={faqs} idPrefix="laundry-faq" className="lg:col-span-8" />
      </Container>
    </section>
  );
};

export default FAQ;
