import React from 'react';
import {Container, NumberedGrid, SectionHeader} from '../common/ui';

const reasons = [
    {
        title: 'Attention to detail',
        body: 'Washed by hand, panel by panel, by a team trained to look twice. We finish to a standard, not to a stopwatch.',
    },
    {
        title: 'Care',
        body: 'Your car is treated like it belongs to someone who loves it - because it does. Trained hands, the right products, no shortcuts.',
    },
    {
        title: 'Convenience',
        body: 'Drive in, no appointment needed. We wash it in place while you wait - you keep the keys and your car never leaves your sight.',
    },
    {
        title: 'Integrity',
        body: 'Before every interior clean we check with you about your valuables. Nothing is touched without your say-so, and we do exactly what we said we would.',
    },
];

const WhyJaranow: React.FC = () => {
    return (
        <section id="why-jaranow" className="bg-ink py-20 text-white sm:py-28">
            <Container className="grid gap-12 lg:grid-cols-12">
                <SectionHeader
                    tone="dark"
                    className="lg:col-span-4"
                    eyebrow="Why Jaranow"
                    title="Done properly, every time."
                    intro="The same care behind Laundry by Jaranow, brought to your car."
                />
                <NumberedGrid tone="dark" items={reasons} className="lg:col-span-8"/>
            </Container>
        </section>
    );
};

export default WhyJaranow;
