import React from 'react';
import {Container, NumberedGrid, SectionHeader} from '../common/ui';

// The four brand values, each tied to something a customer can actually see.
const values = [
    {
        title: 'Attention to detail',
        body: 'Door shuts, wheel arches, the inside of a collar. We go over the places most people skip, then look again before handing back.',
    },
    {
        title: 'Care',
        body: 'Cars are washed by hand. Clothes are sorted by colour and fabric, and stains are treated before anything goes in.',
    },
    {
        title: 'Convenience',
        body: 'No app, no account. Drive in without an appointment, or have your laundry picked up from your door.',
    },
    {
        title: 'Integrity',
        body: 'Your car is never moved and your keys never leave you. If something is not right, we tell you, and we put it right.',
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
                    intro="Whether it is your car or your clothes, the job is not finished until it has been checked."
                />
                <NumberedGrid items={values} className="lg:col-span-8"/>
            </Container>
        </section>
    );
};

export default Standard;
