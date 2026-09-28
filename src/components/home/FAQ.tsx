import React from 'react';
import {Link} from 'react-router-dom';
import {Container, FaqItem, FaqList, SectionHeader, whatsappUrl} from '../common/ui';

// Questions are phrased the way people search for them.
const faqs: FaqItem[] = [
    {
        question: 'Where is the Jaranow car wash?',
        answer: 'On 6th Avenue, Gwarinpa, Abuja. We are open every day from 8am to 7pm.',
    },
    {
        question: 'How do I book a car wash?',
        answer: 'Use the booking form on the car wash page or message us on WhatsApp with your car and a preferred time, and we will confirm your slot.',
    },
    {
        question: 'How does laundry pickup and delivery work?',
        answer: 'Choose a monthly plan or pay per item, and we collect from your door on your pickup days - Tuesday and Saturday on Lite, plus Thursday on Premium. Everything comes back washed, dried, ironed and folded within 48 hours of pickup.',
    },
    {
        question: 'Which parts of Abuja do you cover?',
        answer: 'The car wash is in Gwarinpa. Laundry is collected and delivered across Abuja - send us your address on WhatsApp and we will confirm your pickup. Lagos, Port Harcourt and Ibadan are next.',
    },
    {
        question: 'How much do the car wash and laundry cost?',
        answer: (
            <>
                Every price for both services is on our{' '}
                <Link to="/pricing" className="font-medium text-primary-600 underline underline-offset-4">
                    pricing page
                </Link>
                . If you are not sure which option suits you, ask us on WhatsApp.
            </>
        ),
    },
    {
        question: 'What if something is not right?',
        answer: 'Tell us on WhatsApp at +234 903 862 2012. We will look at it with you and put it right.',
    },
];

const FAQ: React.FC = () => {
    return (
        <section id="faq" className="bg-paper py-20 sm:py-28">
            <Container className="grid gap-12 lg:grid-cols-12">
                <SectionHeader
                    className="lg:col-span-4"
                    eyebrow="Questions"
                    title="Questions, answered."
                    intro={
                        <>
                            Anything else,{' '}
                            <a
                                href={whatsappUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary-600 underline underline-offset-4"
                            >
                                ask us on WhatsApp
                            </a>
                            .
                        </>
                    }
                />
                <FaqList items={faqs} idPrefix="home-faq" className="lg:col-span-8"/>
            </Container>
        </section>
    );
};

export default FAQ;
