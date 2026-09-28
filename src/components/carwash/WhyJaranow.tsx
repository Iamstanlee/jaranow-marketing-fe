import React from 'react';
import {Container, NumberedGrid, SectionHeader} from '../common/ui';

const reasons = [
    {
        title: 'Attention to detail',
        body: 'Washed panel by panel by a team trained to look twice. We finish to a standard, not to a stopwatch.',
    },
    {
        title: 'Care',
        body: 'We treat your car like it belongs to someone who loves it - because it does. A trained team, the right products, no shortcuts.',
    },
    {
        title: 'Convenience',
        body: 'We wash it while you wait, on 6th Avenue in Gwarinpa, every day from 8am to 7pm. Book ahead on WhatsApp and we will be ready for you.',
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
