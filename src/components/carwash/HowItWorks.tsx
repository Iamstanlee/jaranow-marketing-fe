import React from 'react';
import {Container, SectionHeader, StepRow} from '../common/ui';

const steps = [
    {
        title: 'Drive in',
        body: 'Pull in at 6th Avenue, Gwarinpa. No appointment needed - tell us which wash and we take it from there.',
    },
    {
        title: 'We wash by hand',
        body: 'Inside, outside, or both. We check with you about valuables before touching the interior.',
    },
    {
        title: 'Drive off',
        body: 'We walk round the car with you before you settle up. Then it is yours, and you are on your way.',
    },
];

const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="bg-white py-20 sm:py-28">
            <Container>
                <SectionHeader eyebrow="How it works" title="In, washed, out." className="max-w-2xl"/>
                <div className="mt-14">
                    <StepRow steps={steps}/>
                </div>
            </Container>
        </section>
    );
};

export default HowItWorks;
