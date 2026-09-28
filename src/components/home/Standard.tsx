import React from 'react';
import {Container, NumberedGrid, SectionHeader} from '../common/ui';

// The four brand values, each tied to something a customer can actually see.
const values = [
    {
        title: 'Attention to detail',
        body: 'From door frames and wheel arches to shirt collars and cuffs, we clean the spots others miss, so your car shines and your clothes come back crisp.',
    },
    {
        title: 'Care',
        body: 'Cars are washed carefully, never rushed through. Clothes are sorted by colour and fabric, and stains are treated before anything goes in.',
    },
    {
        title: 'Convenience',
        body: 'Open every day in Gwarinpa for your car. For laundry, one WhatsApp message and we collect from your door on your pickup day.',
    },
    {
        title: 'Integrity',
        body: 'We tell you what we will do, then we do it. If something is not right, you hear it from us first - and we put it right.',
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
                    intro="Your car or your clothes - either way, you get it back looking its best."
                />
                <NumberedGrid items={values} className="lg:col-span-8"/>
            </Container>
        </section>
    );
};

export default Standard;
