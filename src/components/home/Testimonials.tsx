import React from 'react';
import {Container, SectionHeader, Testimonial, TestimonialGrid} from '../common/ui';

// Kept to the three that describe something specific we did. The customer-count,
// rating and "24/7" stats that used to sit under these were unverified and are gone.
const testimonials: Testimonial[] = [
    {
        name: 'Chioma Adebayo',
        role: 'Busy professional',
        content: 'I drove in on my way to work and my car came out spotless. They caught marks I had stopped noticing, and I was back on the road in no time.',
        tag: 'Car wash',
    },
    {
        name: 'Emeka Nwosu',
        role: 'Student',
        content: 'They asked about my valuables before cleaning the interior and never moved my car. Little things like that made me trust them instantly.',
        tag: 'Car wash',
    },
    {
        name: 'Blessing Eze',
        role: 'Consultant',
        content: 'My clothes are picked up, washed, ironed and delivered back to me. Everything comes back folded exactly the same way, every time.',
        tag: 'Laundry',
    },
];

const Testimonials: React.FC = () => {
    return (
        <section id="testimonials" className="bg-ink py-20 text-white sm:py-28">
            <Container>
                <SectionHeader tone="dark" eyebrow="In their words" title="The little things get noticed." className="max-w-2xl"/>
                <div className="mt-14">
                    <TestimonialGrid testimonials={testimonials}/>
                </div>
            </Container>
        </section>
    );
};

export default Testimonials;
