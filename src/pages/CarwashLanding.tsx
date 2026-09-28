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
import {CARWASH_PRICE_LIST} from '../data/carwashPrices';

/* Services beyond the three cards, from the same data the "More prices" list
   renders - so the JSON-LD cannot drift from what the page shows. */
const extraOffers = CARWASH_PRICE_LIST.flatMap((section) =>
    section.items
        .filter((item) => !item.onCards)
        .map((item) => ({
            '@type': 'Offer',
            itemOffered: {'@type': 'Service', name: item.name, description: item.note},
            price: String(item.price),
            priceCurrency: 'NGN',
        }))
);

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
        <div className="min-h-screen bg-paper">
            <SeoTags route="/carwash"/>
            <Helmet>
                <meta
                    name="keywords"
                    content="car wash Gwarinpa, car wash Abuja, car wash near me Gwarinpa, interior car cleaning Abuja, car vacuum Abuja, Carwash by Jaranow"
                />

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'AutoWash',
                        name: 'Carwash by Jaranow',
                        description:
                            'Car wash at 6th Avenue, Gwarinpa, Abuja. Exterior, full and vacuum washes while you wait - drive off in a clean, fresh car.',
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
                                        description: 'Full exterior wash, wheels, tyres and glass',
                                    },
                                    price: '2000',
                                    priceCurrency: 'NGN',
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: {
                                        '@type': 'Service',
                                        name: 'Full Wash',
                                        description: 'Exterior wash with the interior cleaned',
                                    },
                                    price: '3000',
                                    priceCurrency: 'NGN',
                                },
                                {
                                    '@type': 'Offer',
                                    itemOffered: {
                                        '@type': 'Service',
                                        name: 'Vacuum Wash',
                                        description: 'Exterior wash with the interior machine-vacuumed',
                                    },
                                    price: '4000',
                                    priceCurrency: 'NGN',
                                },
                                ...extraOffers,
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
