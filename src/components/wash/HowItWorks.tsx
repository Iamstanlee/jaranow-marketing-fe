import React from 'react';
import {Container, SectionHeader, StepRow} from '../common/ui';

const steps = [
  {
    title: 'Pick a plan',
    body: 'Lite or Premium, depending on how much your household gets through. Or pay per item if you only need us now and then.',
  },
  {
    title: 'We collect',
    body: 'On your pickup days - Tuesday and Saturday, with Thursday added on Premium. We confirm on WhatsApp before we come.',
  },
  {
    title: 'We clean and press',
    body: 'Sorted, treated, washed, dried and pressed, so every item comes back crisp and ready to wear.',
  },
  {
    title: 'Back in 48 hours',
    body: 'Returned to your door, folded and ready to put away, within 48 hours of pickup.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="bg-white py-20 sm:py-28">
      <Container>
        <SectionHeader
          eyebrow="How it works"
          title="Out the door, back in two days."
          intro="Laundry pickup and delivery in Abuja, from your first message to a folded pile at your door."
          className="max-w-2xl"
        />
        <div className="mt-14">
          <StepRow steps={steps} />
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
