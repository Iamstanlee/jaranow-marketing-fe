import React, {useEffect, useRef} from 'react';
import {Helmet} from 'react-helmet-async';

import Header from '../components/common/Header';
import Hero from '../components/carwash/Hero';
import Pricing from '../components/carwash/Pricing';
import HowItWorks from '../components/carwash/HowItWorks';
import WhyJaranow from '../components/carwash/WhyJaranow';
import BookingForm, {BookingFormHandle} from '../components/carwash/BookingForm';
import Footer from '../components/common/Footer';
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
            <Helmet>
                <title>Carwash by Jaranow - Fixed-Price Car Wash in Gwarinpa, Abuja</title>
                <meta
                    name="description"
                    content="Carwash by Jaranow: fixed-price car washing in Gwarinpa, Abuja. Exterior wash ₦2,000, full interior + exterior wash ₦3,000. No negotiation, no hidden charges. Drive in, we wash, you drive off."
                />
                <meta
                    name="keywords"
                    content="car wash Abuja, car wash Gwarinpa, fixed price car wash, Jaranow carwash, interior car cleaning Abuja, exterior car wash Nigeria"
                />
                <link rel="canonical" href="https://jaranow.com/carwash"/>

                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://jaranow.com/carwash"/>
                <meta property="og:image" content="https://jaranow.com/carwash/opengraph.png"/>
                <meta name="twitter:image" content="https://jaranow.com/carwash/opengraph.png"/>
                <meta property="og:title" content="Carwash by Jaranow - Fixed-Price Car Wash in Gwarinpa"/>
                <meta
                    property="og:description"
                    content="Your car, handled - you don't lift a finger. Fixed-price car washing in Gwarinpa, Abuja. Exterior ₦2,000, Full Wash ₦3,000."
                />
                <meta property="og:site_name" content="Carwash by Jaranow"/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content="Carwash by Jaranow - Fixed-Price Car Wash in Gwarinpa"/>
                <meta
                    name="twitter:description"
                    content="Your car, handled - you don't lift a finger. Fixed-price car washing in Gwarinpa, Abuja."
                />
                <meta name="twitter:site" content="@jara_now"/>

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'AutoWash',
                        name: 'Carwash by Jaranow',
                        description:
                            'Fixed-price car washing in Gwarinpa, Abuja. Drive in, we wash, you drive off.',
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
