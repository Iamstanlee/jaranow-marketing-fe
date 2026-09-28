import React from 'react';
import {Container, SectionHeader, StepRow} from '../common/ui';

const steps = [
    {
        title: 'Book and drive in',
        body: 'Book a time on WhatsApp or the form below, then bring the car to 6th Avenue, Gwarinpa. Open every day, 8am to 7pm.',
    },
    {
        title: 'We wash it properly',
        body: 'Outside, inside, or both, while you wait. We check with you about valuables before we touch the interior.',
    },
    {
        title: 'Drive off',
        body: 'Head off in a clean, fresh car - gleaming outside, tidy inside, and ready to be seen in.',
    },
];

const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="bg-white py-20 sm:py-28">
            <Container>
                <SectionHeader
                    eyebrow="How it works"
                    title="In, washed, out."
                    intro="A proper car wash in Gwarinpa, in three steps."
                    className="max-w-2xl"
                />
                <div className="mt-14">
                    <StepRow steps={steps}/>
                </div>
            </Container>
        </section>
    );
};

export default HowItWorks;
