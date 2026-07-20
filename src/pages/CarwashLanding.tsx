import React, {useEffect, useRef} from 'react';
import {Helmet} from 'react-helmet-async';

import Header from '../components/common/Header';
import Hero from '../components/carwash/Hero';
import Pricing from '../components/carwash/Pricing';
import HowItWorks from '../components/carwash/HowItWorks';
import WhyJaranow from '../components/carwash/WhyJaranow';
import BookingForm, {BookingFormHandle} from '../components/carwash/BookingForm';
import Footer from '../components/common/Footer';
import SeoTags from '../seo/SeoTags';
import {scrollToElement} from '../utils/formatters';

const CarwashLanding: React.FC = () => {
    const bookingRef = useRef<BookingFormHandle>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const goToBooking = (washType?: string) => {
        if (washType) {
            bookingRef.current?.setWashType(washType);
        }
        scrollToElement('booking');
    };

    return (
        <div className="min-h-screen bg-white">
            <SeoTags route="/carwash"/>
            <Helmet>
                <meta
                    name="keywords"
                    content="car wash Abuja, car wash Gwarinpa, hand car wash, Jaranow carwash, interior car cleaning Abuja, exterior car wash Nigeria"
                />

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'AutoWash',
                        name: 'Carwash by Jaranow',
                        description:
                            'Hand car washing in Gwarinpa, Abuja. Drive in, we wash, you drive off.',
                        url: 'https://jaranow.com/carwash',
                        telephone: '+234-903-862-2012',
                        address: {
                            '@type': 'PostalAddress',
                            streetAddress: '6th Avenue, Gwarinpa',
                            addressLocality: 'Abuja',
                            addressRegion: 'FCT',
                            addressCountry: 'NG',
                        },
                        openingHours: 'Mo-Su 08:00-19:00',
                        priceRange: '₦₦',
                        hasOfferCatalog: {
                            '@type': 'OfferCatalog',
                            name: 'Car Wash Services',
                            itemListElement: [
                                {
                                    '@type': 'Offer',
                                    itemOffered: {
                                        '@type': 'Service',
                                        name: 'Exterior Wash',
                                        description: 'Full exterior hand wash',
                                    },
                                    price: '2000',
                                    priceCurrency: 'NGN',
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: {
                                        '@type': 'Service',
                                        name: 'Full Wash',
                                        description: 'Interior and exterior wash',
                                    },
                                    price: '3000',
                                    priceCurrency: 'NGN',
                                },
                            ],
                        },
                        sameAs: [
                            'https://instagram.com/jara_now',
                            'https://twitter.com/jara_now',
                            'https://facebook.com/jaranow',
                        ],
                    })}
                </script>
            </Helmet>

            <Header logo="carwash" ctaLabel="Book a wash" onCtaClick={() => goToBooking()}/>

            <main>
                <Hero onBook={() => goToBooking()}/>
                <Pricing onBook={(washType) => goToBooking(washType)}/>
                <HowItWorks/>
                <WhyJaranow/>
                <BookingForm ref={bookingRef}/>
            </main>

            <Footer/>
        </div>
    );
};

export default CarwashLanding;
