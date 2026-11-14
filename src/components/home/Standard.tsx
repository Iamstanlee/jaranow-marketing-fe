import React from 'react';
import {Container, NumberedGrid, SectionHeader} from '../common/ui';

const values = [
    {
        title: 'Attention to detail',
        body: 'Door frames, wheel arches and the corners of the dashboard. Shirt collars and cuffs. We clean the places others skip, so your car shines and your clothes come back crisp.',
    },
    {
        title: 'Care',
        body: 'Your car is washed with patience, never rushed to clear a queue. Clothes are sorted by colour and fabric and stains are treated first, so your whites stay white.',
    },
    {
        title: 'Convenience',
        body: 'The car wash is open every day in Gwarinpa. For laundry, one WhatsApp message and we pick up from your door - no light, no water, no wasted weekend on your side.',
    },
    {
        title: 'Integrity',
        body: 'We tell you what we will do, and we do it. If anything is not right, you hear it from us first, and we make it right.',
    },
];

const Standard: React.FC = () => {
    return (
        <section id="standard" className="bg-paper py-20 sm:py-28">
            <Container className="grid gap-12 lg:grid-cols-12">
                <SectionHeader
                    className="lg:col-span-4"
                    eyebrow="The standard"
                    title="Two services. One way of working."
                    intro="Your car or your clothes, it comes back looking its best."
                />
                <NumberedGrid items={values} className="lg:col-span-8"/>
            </Container>
        </section>
    );
};

export default Standard;
