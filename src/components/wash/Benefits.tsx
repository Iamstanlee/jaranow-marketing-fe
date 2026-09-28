import React from 'react';
import {Container, NumberedGrid, SectionHeader} from '../common/ui';

// What a subscriber actually gets. The "3-5 hours saved", "99.9% satisfaction",
// money-back and 24/7 claims that used to sit here were never confirmed.
const benefits = [
  {
    title: 'Collected and returned',
    body: 'We pick up from your door on your pickup days and bring everything back within 48 hours - washed, dried, ironed and folded.',
  },
  {
    title: 'Sorted with care',
    body: 'Clothes are sorted by colour and fabric, and stains are treated before anything goes in. Tell us about anything delicate and we handle it accordingly.',
  },
  {
    title: 'Checked item by item',
    body: 'Nothing comes back to you until it has been looked over. If it is not right, it does not leave us.',
  },
  {
    title: 'Straight with you',
    body: 'We tell you what we can do and then we do it. If something goes wrong, you hear it from us first.',
  },
];

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="bg-paper py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-12">
        <SectionHeader
          className="lg:col-span-4"
          eyebrow="What you get"
          title="Your week, minus the laundry."
          intro="Arrange everything on WhatsApp - a pickup, a change of date, a stubborn stain. No app to download, no account to create."
        />
        <NumberedGrid items={benefits} className="lg:col-span-8" />
      </Container>
    </section>
  );
};

export default Benefits;
