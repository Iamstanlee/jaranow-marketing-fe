import React from 'react';
import {Link} from 'react-router-dom';
import {Container, FaqItem, FaqList, SectionHeader, whatsappUrl} from '../common/ui';

const faqs: FaqItem[] = [
    {
        question: 'Do I need to book the car wash?',
        answer: 'No. Drive in to 6th Avenue, Gwarinpa any day between 8am and 7pm. If you would rather book ahead, use the form on the car wash page or message us on WhatsApp.',
    },
    {
        question: 'How does laundry pickup work?',
        answer: 'Choose a monthly plan and we collect from your door on your pickup days - Tuesday and Saturday on Lite, plus Thursday on Premium. Everything comes back washed, dried, ironed and folded within 48 hours of pickup.',
    },
    {
        question: 'Where do you operate?',
        answer: 'The car wash is at 6th Avenue, Gwarinpa, Abuja. Laundry is collected and delivered across Abuja. Lagos, Port Harcourt and Ibadan are next.',
    },
    {
        question: 'How much does it cost?',
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
                    title="Before you come in."
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
