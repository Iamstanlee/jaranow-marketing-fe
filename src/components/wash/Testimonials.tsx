import React from 'react';
import {Container, SectionHeader, Testimonial, TestimonialGrid} from '../common/ui';

// The trust badges (insured, 4.9/5, 500+ orders, money-back) and the stats block
// that used to sit around these were unverified and have been removed.
const testimonials: Testimonial[] = [
  {
    name: 'Adebayo Johnson',
    role: 'Gwarinpa, Abuja',
    content: 'I no longer lose weekends to laundry. The quality is excellent and pickup is always on time.',
  },
  {
    name: 'Sarah Ogunleye',
    role: 'Gwarinpa, Abuja',
    content: 'I was sceptical about laundry services, but my clothes come back cleaner than I manage at home, and the folding is perfect.',
  },
  {
    name: 'Anonymous',
    role: 'Maitama, Abuja',
    content: "I book a pickup on WhatsApp and my laundry is handled properly, every time. That's hours back with my family each week.",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <Container>
        <SectionHeader tone="dark" eyebrow="In their words" title="Handled properly, every time." className="max-w-2xl" />
        <div className="mt-14">
          <TestimonialGrid testimonials={testimonials} />
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
