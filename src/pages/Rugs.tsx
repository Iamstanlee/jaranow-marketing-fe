import React from 'react';
import {Helmet} from 'react-helmet-async';
import {motion} from 'framer-motion';
import {ArrowRight, Home as HomeIcon, MessageCircle, Ruler, Sparkles} from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import WhatsAppForm, {FormField} from '../components/common/WhatsAppForm';
import {
    btn,
    Container,
    CtaBand,
    FactPanel,
    FaqItem,
    FaqList,
    HeroTitle,
    InkBackdrop,
    Lift,
    NumberedGrid,
    SectionHeader,
    StepRow,
    openWhatsApp,
    whatsappUrl,
} from '../components/common/ui';
import {CARWASH_PRICE_LIST} from '../data/carwashPrices';
import {fadeInUp, staggerContainer} from '../utils/animations';
import {formatCurrency, scrollToElement} from '../utils/formatters';
import {useLandingScroll} from '../utils/useLandingScroll';
import SeoTags from '../seo/SeoTags';

/* Rug cleaning with pickup and delivery. Prices come from the same data as the
   forecourt price list (src/data/carwashPrices.ts), so the two cannot disagree.
   No turnaround is promised - the return date is confirmed at collection. */

const rugs = CARWASH_PRICE_LIST.find((s) => s.title === 'Rug')?.items ?? [];

const facts = [
    {icon: <HomeIcon size={17}/>, label: 'Pickup', value: 'Collected from your door, returned to it'},
    {icon: <Ruler size={17}/>, label: 'Sizes', value: 'Bedside, centre and sitting-room rugs'},
    {icon: <MessageCircle size={17}/>, label: 'Arranged on', value: 'WhatsApp - send a photo, we do the rest'},
    {icon: <Sparkles size={17}/>, label: 'You get', value: 'A fresh, clean rug, back on your floor'},
];

const steps = [
    {title: 'Message us', body: 'Tell us the size - or just send a photo on WhatsApp - and pick a day for collection.'},
    {title: 'We collect', body: 'We pick the rug up from your door, so there is nothing to roll, carry or load.'},
    {title: 'We clean it thoroughly', body: 'Washed through and dried properly, so it comes back fresh rather than just surface-clean.'},
    {title: 'Back on your floor', body: 'Returned to your door, fresh and ready to lay straight down. We confirm the date when we collect.'},
];

const benefits = [
    {
        title: 'Fresh, not just tidied',
        body: 'Dust, grime and everyday marks lifted out, so the rug looks brighter, feels softer and smells clean again.',
    },
    {
        title: 'Collected and returned',
        body: 'No wrestling a rug into the car boot. We collect from your door and bring it back to the same place.',
    },
    {
        title: 'Handled with care',
        body: 'Every rug is looked at before it is cleaned, and treated according to its size and material.',
    },
    {
        title: 'Straight with you',
        body: 'We tell you what to expect before we start, and we do what we said we would.',
    },
];

const pickupFields: FormField[] = [
    {name: 'name', label: 'Your name', type: 'text', placeholder: 'Full name', required: true},
    {name: 'phone', label: 'Phone number', type: 'tel', placeholder: 'e.g. 0903 862 2012', required: true},
    {name: 'area', label: 'Pickup address', type: 'text', placeholder: 'Street and area, e.g. 3rd Avenue, Gwarinpa', required: true, full: true},
    {
        name: 'size',
        label: 'Rug size',
        type: 'select',
        options: [...rugs.map((r) => `${r.name} - ${formatCurrency(r.price)}`), 'A mix of sizes', 'Not sure - I will send a photo'],
        required: true,
    },
    {name: 'count', label: 'How many rugs', type: 'select', options: ['1', '2', '3', '4 or more'], required: true},
    {name: 'day', label: 'Preferred pickup day', type: 'text', placeholder: 'e.g. Saturday morning', full: true},
    {name: 'notes', label: 'Anything we should know', type: 'textarea', placeholder: 'Stains, material, anything delicate'},
];

const faqs: FaqItem[] = [
    {
        question: 'How much does rug cleaning cost?',
        answer: `It depends on size: ${rugs.map((r) => `${r.name.toLowerCase()} ${formatCurrency(r.price)}`).join(', ')}. Not sure which yours is? Send a photo on WhatsApp.`,
    },
    {
        question: 'Do you collect rugs from my home?',
        answer: 'Yes. We collect from your door and bring the rug back to you. Send your address on WhatsApp or through the form and we will confirm your pickup.',
    },
    {
        question: 'How long does it take?',
        answer: 'It depends on the rug and how long it needs to dry properly. We confirm your return date when we collect.',
    },
    {
        question: 'What sizes do you clean?',
        answer: 'Bedside and centre rugs through to large sitting-room rugs.',
    },
    {
        question: 'What if something is not right?',
        answer: 'Tell us on WhatsApp at +234 903 862 2012. We will look at it with you and put it right.',
    },
];

const bookRug = (name: string, price: number) =>
    openWhatsApp(`Hi Jaranow! I'd like to book a rug pickup.\n\nRug: ${name} (${formatCurrency(price)})`);

const Rugs: React.FC = () => {
    useLandingScroll();

    const goToPickup = () => scrollToElement('pickup');

    return (
        <div className="min-h-screen bg-paper">
            <SeoTags route="/rugs"/>
            <Helmet>
                <meta
                    name="keywords"
                    content="rug cleaning Abuja, rug wash Abuja, carpet cleaning Abuja, rug cleaning pickup and delivery Abuja, rug cleaning Gwarinpa"
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Service',
                        name: 'Rug cleaning with pickup & delivery',
                        serviceType: 'Rug cleaning',
                        description:
                            'Rug cleaning in Abuja with pickup and delivery. Collected from your door, cleaned thoroughly and returned fresh.',
                        url: 'https://jaranow.com/rugs',
                        areaServed: {'@type': 'City', name: 'Abuja'},
                        provider: {'@type': 'LocalBusiness', name: 'Jaranow', telephone: '+234-903-862-2012'},
                        hasOfferCatalog: {
                            '@type': 'OfferCatalog',
                            name: 'Rug cleaning',
                            itemListElement: rugs.map((r) => ({
                                '@type': 'Offer',
                                itemOffered: {'@type': 'Service', name: r.name, description: r.note},
                                price: String(r.price),
                                priceCurrency: 'NGN',
                            })),
                        },
                    })}
                </script>
            </Helmet>

            <Header ctaLabel="Book a pickup" onCtaClick={goToPickup}/>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden bg-ink text-white">
                    <InkBackdrop/>
                    <Container className="relative pt-32 pb-20 sm:pt-40 lg:pb-28">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                            className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-12"
                        >
                            <div className="lg:col-span-7">
                                <HeroTitle kicker="Rug cleaning with pickup & delivery in Abuja">
                                    Your rugs, handled<span className="text-primary-600">.</span>
                                </HeroTitle>
                                <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
                                    We collect your rugs from your door, clean them thoroughly and bring them back fresh and
                                    ready to lay down. Your floor looks new again, and you never lift a thing.
                                </motion.p>
                                <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
                                    <Lift>
                                        <button onClick={goToPickup} className={`${btn.primary} group w-full`}>
                                            Book a pickup
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                                        </button>
                                    </Lift>
                                    <Lift>
                                        <a href="#prices" className={`${btn.ghostOnDark} w-full`}>
                                            See prices
                                        </a>
                                    </Lift>
                                </motion.div>
                            </div>
                            <motion.div variants={fadeInUp} className="lg:col-span-5">
                                <FactPanel facts={facts}/>
                            </motion.div>
                        </motion.div>
                    </Container>
                </section>

                {/* Prices */}
                <section id="prices" className="bg-paper py-20 sm:py-28">
                    <Container>
                        <SectionHeader
                            eyebrow="Rug cleaning prices"
                            title="Priced by size."
                            intro="One clear price per rug, whatever it needs. Not sure of the size? Send us a photo on WhatsApp."
                            className="max-w-2xl"
                        />
                        <div className="mt-14 grid gap-6 lg:grid-cols-3">
                            {rugs.map((r, i) => {
                                const dark = i === rugs.length - 1;
                                return (
                                    <Lift key={r.name} className="h-full">
                                        <article
                                            className={`flex h-full flex-col rounded-3xl p-8 sm:p-9 ${
                                                dark ? 'bg-ink text-white' : 'border border-ink/10 bg-white'
                                            }`}
                                        >
                                            <h3 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{r.name}</h3>
                                            <p className={`mt-2 ${dark ? 'text-paper/65' : 'text-ink/60'}`}>{r.note}</p>
                                            <p className="mt-8 flex flex-1 items-baseline gap-2">
                                                <span className={`text-5xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
                                                    {formatCurrency(r.price)}
                                                </span>
                                                <span className={dark ? 'text-paper/55' : 'text-ink/50'}>per rug</span>
                                            </p>
                                            <button onClick={() => bookRug(r.name, r.price)} className={`mt-10 w-full ${dark ? btn.primary : btn.ink}`}>
                                                Book a {r.name.toLowerCase()} pickup
                                            </button>
                                        </article>
                                    </Lift>
                                );
                            })}
                        </div>
                    </Container>
                </section>

                {/* How it works */}
                <section className="bg-white py-20 sm:py-28">
                    <Container>
                        <SectionHeader
                            eyebrow="How it works"
                            title="From your floor, and back again."
                            intro="Rug cleaning with pickup and delivery across Abuja, in four steps."
                            className="max-w-2xl"
                        />
                        <div className="mt-14">
                            <StepRow steps={steps}/>
                        </div>
                    </Container>
                </section>

                {/* What you get */}
                <section className="bg-ink py-20 text-white sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <SectionHeader
                            tone="dark"
                            className="lg:col-span-4"
                            eyebrow="What you get"
                            title="A room that feels new."
                            intro="A clean rug changes the whole room - brighter colour, softer pile, and a fresh smell when you walk in."
                        />
                        <NumberedGrid tone="dark" items={benefits} className="lg:col-span-8"/>
                    </Container>
                </section>

                {/* Pickup form */}
                <section id="pickup" className="bg-paper py-20 sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <SectionHeader
                                eyebrow="Book a pickup"
                                title="Let's collect your rug."
                                intro="Tell us where you are and what you have, and we will confirm your pickup on WhatsApp."
                            />
                            <p className="mt-8 text-ink/60">
                                Easier to show us?{' '}
                                <a
                                    href={whatsappUrl("Hi Jaranow! I'd like to book a rug pickup. Here's a photo of my rug:")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary-600 underline underline-offset-4"
                                >
                                    Send a photo on WhatsApp
                                </a>
                                .
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <WhatsAppForm
                                fields={pickupFields}
                                intro="Hi Jaranow! I'd like to book a rug pickup."
                                submitLabel="Book a pickup"
                                successTitle="Pickup request ready"
                                successBody="We've opened WhatsApp with your details. Send the message and we will confirm your pickup."
                                resetLabel="Book another pickup"
                                footnote="We confirm your pickup on WhatsApp."
                            />
                        </div>
                    </Container>
                </section>

                {/* FAQ */}
                <section className="bg-white py-20 sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <SectionHeader
                            className="lg:col-span-4"
                            eyebrow="Questions"
                            title="Good to know."
                            intro="Anything else about your rugs, ask us on WhatsApp."
                        />
                        <FaqList items={faqs} idPrefix="rugs-faq" className="lg:col-span-8"/>
                    </Container>
                </section>

                <CtaBand title="Ready for a fresh rug?" body="Book a pickup and we will take it from your door - and bring it back clean.">
                    <Lift>
                        <button onClick={goToPickup} className={`${btn.paper} group w-full`}>
                            Book a pickup
                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                        </button>
                    </Lift>
                    <Lift>
                        <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={`${btn.ghostOnAccent} w-full`}>
                            Message us on WhatsApp
                        </a>
                    </Lift>
                </CtaBand>
            </main>

            <Footer/>
        </div>
    );
};

export default Rugs;
