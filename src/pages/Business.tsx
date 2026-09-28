import React from 'react';
import {Helmet} from 'react-helmet-async';
import {motion} from 'framer-motion';
import {
    ArrowRight,
    Building2,
    CalendarClock,
    Car,
    GraduationCap,
    MapPin,
    Sparkles,
    Store,
    Truck,
    Users,
} from 'lucide-react';
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
    SectionHeader,
    StepRow,
    whatsappUrl,
} from '../components/common/ui';
import {CARWASH_PRICE_LIST} from '../data/carwashPrices';
import {fadeInUp, staggerContainer} from '../utils/animations';
import {scrollToElement} from '../utils/formatters';
import {useLandingScroll} from '../utils/useLandingScroll';
import SeoTags from '../seo/SeoTags';

/* Carwash by Jaranow for organisations: fleets, corporates, businesses and
   schools. Washed at 6th Avenue or on site at their premises - both confirmed.
   Pricing is quoted per organisation, so no figures appear on this page. */

const facts = [
    {icon: <MapPin size={17}/>, label: 'Where', value: 'At 6th Avenue, Gwarinpa, or at your premises'},
    {icon: <Users size={17}/>, label: 'For', value: 'Fleets, corporates, businesses and schools'},
    {icon: <CalendarClock size={17}/>, label: 'Schedule', value: 'Agreed with you - regular or as needed'},
    {icon: <Sparkles size={17}/>, label: 'You get', value: 'Clean vehicles, ready for the road'},
];

const audiences = [
    {
        icon: <Truck size={22}/>,
        title: 'Fleets & logistics',
        body: 'Delivery vans, pool cars and ride-hailing fleets kept clean on a steady rhythm, so every vehicle on the road represents you well.',
    },
    {
        icon: <Building2 size={22}/>,
        title: 'Corporate offices',
        body: 'Staff and executive cars washed in your car park during the working day. Your people leave work in a clean car.',
    },
    {
        icon: <Store size={22}/>,
        title: 'Businesses',
        body: 'Company vehicles that meet your customers - showroom cars, hotel shuttles, estate and security vehicles - always looking their best.',
    },
    {
        icon: <GraduationCap size={22}/>,
        title: 'Schools',
        body: 'School buses and staff cars kept clean for parents and pupils, washed on a schedule that works around the school day.',
    },
];

const ways = [
    {
        icon: <MapPin size={20}/>,
        title: 'At 6th Avenue, Gwarinpa',
        body: 'Send your vehicles to us on an agreed schedule. We hold slots for your account so drivers are back on the road quickly.',
        points: ['Slots held for your vehicles', 'Ideal for drivers already passing Gwarinpa', 'Any service on our menu'],
    },
    {
        icon: <Car size={20}/>,
        title: 'At your premises',
        body: 'Our team comes to your car park, depot or school and washes the vehicles on site, so nobody has to leave their desk.',
        points: ['No vehicles off the road', 'Washed while your team works', 'Days and times agreed with you'],
    },
];

const steps = [
    {title: 'Tell us about your vehicles', body: 'How many, what kind, and where they are. The form below takes a minute.'},
    {title: 'We agree a plan', body: 'Which services, where the washing happens, and how often. You get a quote that fits.'},
    {title: 'We wash on schedule', body: 'At 6th Avenue or on site, on the days agreed - without you having to chase it.'},
    {title: 'Clean vehicles, every time', body: 'A fleet that looks cared for, week after week, and a team proud to drive it.'},
];

const services = CARWASH_PRICE_LIST.find((s) => s.title === 'Car')?.items ?? [];

const quoteFields: FormField[] = [
    {name: 'organisation', label: 'Organisation', type: 'text', placeholder: 'Company or school name', required: true},
    {name: 'contact', label: 'Your name', type: 'text', placeholder: 'Full name', required: true},
    {name: 'phone', label: 'Phone number', type: 'tel', placeholder: 'e.g. 0903 862 2012', required: true},
    {
        name: 'type',
        label: 'Type of organisation',
        type: 'select',
        options: ['Fleet or logistics', 'Corporate office', 'Business', 'School'],
        required: true,
    },
    {
        name: 'vehicles',
        label: 'Number of vehicles',
        type: 'select',
        options: ['1–5', '6–20', '21–50', 'More than 50'],
        required: true,
    },
    {
        name: 'where',
        label: 'Where to wash',
        type: 'select',
        options: ['At 6th Avenue, Gwarinpa', 'At our premises', 'Not sure yet'],
        required: true,
    },
    {name: 'location', label: 'Your location', type: 'text', placeholder: 'e.g. Wuse 2, Abuja'},
    {
        name: 'frequency',
        label: 'How often',
        type: 'select',
        options: ['Weekly', 'Every two weeks', 'Monthly', 'As needed'],
    },
    {
        name: 'notes',
        label: 'Anything else',
        type: 'textarea',
        placeholder: 'Vehicle types, services you need, preferred days',
    },
];

const faqs: FaqItem[] = [
    {
        question: 'Can you wash our vehicles at our premises?',
        answer: 'Yes. Our team can come to your car park, depot or school, or your vehicles can come to us at 6th Avenue, Gwarinpa. Many organisations use a mix of both.',
    },
    {
        question: 'How is fleet and corporate pricing worked out?',
        answer: 'We quote per organisation, based on the number and type of vehicles, the services each one needs, and how often. Send the form and we will come back with a plan.',
    },
    {
        question: 'Do you wash school buses?',
        answer: 'Yes - school buses and staff cars alike, on a schedule that works around the school day.',
    },
    {
        question: 'Which services can we choose?',
        answer: 'Anything on our menu, from a body wash to premium detailing, and each vehicle can get something different.',
    },
    {
        question: 'Which parts of Abuja do you cover for on-site washing?',
        answer: 'Tell us where your vehicles are on the form or on WhatsApp, and we will confirm we can come to you.',
    },
    {
        question: 'How often can you come?',
        answer: 'As often as suits you - weekly, every two weeks, monthly or as needed. We agree the schedule together.',
    },
];

const Business: React.FC = () => {
    useLandingScroll();

    const goToQuote = () => scrollToElement('quote');

    return (
        <div className="min-h-screen bg-paper">
            <SeoTags route="/business"/>
            <Helmet>
                <meta
                    name="keywords"
                    content="fleet car wash Abuja, corporate car wash Abuja, mobile car wash for businesses Abuja, school bus wash Abuja, company car washing Abuja, on-site car wash Abuja"
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Service',
                        name: 'Fleet & corporate car wash',
                        serviceType: 'Fleet car washing',
                        description:
                            'Car washing for fleets, corporates, businesses and schools in Abuja - at 6th Avenue, Gwarinpa, or on site at your premises, on a schedule agreed with you.',
                        url: 'https://jaranow.com/business',
                        areaServed: {'@type': 'City', name: 'Abuja'},
                        audience: {'@type': 'BusinessAudience', name: 'Fleets, corporates, businesses and schools'},
                        provider: {
                            '@type': 'AutoWash',
                            name: 'Carwash by Jaranow',
                            telephone: '+234-903-862-2012',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: '6th Avenue, Gwarinpa',
                                addressLocality: 'Abuja',
                                addressRegion: 'FCT',
                                addressCountry: 'NG',
                            },
                        },
                    })}
                </script>
            </Helmet>

            <Header logo="carwash" ctaLabel="Get a quote" onCtaClick={goToQuote}/>

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
                                <HeroTitle kicker="Fleet & corporate car wash in Abuja">
                                    Every vehicle, handled<span className="text-primary-600">.</span>
                                </HeroTitle>
                                <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
                                    Company cars, delivery vans, staff vehicles and school buses, washed on a schedule that
                                    suits you - at 6th Avenue, Gwarinpa, or by our team at your premises.
                                </motion.p>
                                <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
                                    <Lift>
                                        <button onClick={goToQuote} className={`${btn.primary} group w-full`}>
                                            Get a quote
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                                        </button>
                                    </Lift>
                                    <Lift>
                                        <a href="#how-it-works" className={`${btn.ghostOnDark} w-full`}>
                                            How it works
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

                {/* Who it's for */}
                <section className="bg-paper py-20 sm:py-28">
                    <Container>
                        <SectionHeader
                            eyebrow="Who it's for"
                            title="Built for organisations on the move."
                            intro="Whether you run five vehicles or fifty, we keep them clean so your team and your customers notice."
                            className="max-w-2xl"
                        />
                        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {audiences.map((a) => (
                                <li key={a.title} className="flex flex-col rounded-3xl border border-ink/10 bg-white p-7">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                                        {a.icon}
                                    </span>
                                    <h3 className="mt-6 text-xl font-bold tracking-tight text-ink">{a.title}</h3>
                                    <p className="mt-2 leading-relaxed text-ink/65">{a.body}</p>
                                </li>
                            ))}
                        </ul>
                    </Container>
                </section>

                {/* Two ways */}
                <section className="bg-white py-20 sm:py-28">
                    <Container>
                        <SectionHeader
                            eyebrow="Two ways to work with us"
                            title="We come to you, or you come to us."
                            intro="Choose what suits your operation - or use both, depending on the vehicle."
                            className="max-w-2xl"
                        />
                        <div className="mt-14 grid gap-6 lg:grid-cols-2">
                            {ways.map((w, i) => (
                                <article
                                    key={w.title}
                                    className={`flex flex-col rounded-3xl p-8 sm:p-10 ${
                                        i === 1 ? 'bg-ink text-white' : 'border border-ink/10 bg-paper/60'
                                    }`}
                                >
                                    <span
                                        className={`flex h-11 w-11 items-center justify-center rounded-full ${
                                            i === 1 ? 'bg-primary-600/20 text-primary-400' : 'bg-white text-primary-600'
                                        }`}
                                    >
                                        {w.icon}
                                    </span>
                                    <h3 className={`mt-6 text-2xl font-bold tracking-tight ${i === 1 ? 'text-white' : 'text-ink'}`}>
                                        {w.title}
                                    </h3>
                                    <p className={`mt-3 leading-relaxed ${i === 1 ? 'text-paper/70' : 'text-ink/65'}`}>{w.body}</p>
                                    <ul className={`mt-8 space-y-3 border-t pt-8 ${i === 1 ? 'border-paper/10' : 'border-ink/10'}`}>
                                        {w.points.map((p) => (
                                            <li key={p} className={`flex items-center gap-3 ${i === 1 ? 'text-paper/85' : 'text-ink/75'}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${i === 1 ? 'bg-primary-400' : 'bg-primary-600'}`}/>
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </Container>
                </section>

                {/* Services */}
                <section className="bg-ink py-20 text-white sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <SectionHeader
                            tone="dark"
                            className="lg:col-span-4"
                            eyebrow="What we can do"
                            title="The full menu, for every vehicle."
                            intro="Pick the services each vehicle needs. We quote on your vehicles, the services and how often, so the plan fits how you run."
                        />
                        <ul className="grid gap-px overflow-hidden rounded-2xl border border-paper/10 bg-paper/10 sm:grid-cols-2 lg:col-span-8">
                            {services.map((s) => (
                                <li key={s.name} className="bg-ink p-6 sm:[&:last-child:nth-child(odd)]:col-span-2">
                                    <p className="font-medium text-white">
                                        {s.name}
                                        {s.badge && (
                                            <span className="ml-2 inline-block rounded-full bg-primary-600 px-2.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                                                {s.badge}
                                            </span>
                                        )}
                                    </p>
                                    {s.note && <p className="mt-1 text-sm leading-relaxed text-paper/55">{s.note}</p>}
                                </li>
                            ))}
                        </ul>
                    </Container>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="bg-white py-20 sm:py-28">
                    <Container>
                        <SectionHeader
                            eyebrow="How it works"
                            title="Set up once. Clean for good."
                            intro="Fleet car washing in Abuja, from first message to a routine you never have to think about."
                            className="max-w-2xl"
                        />
                        <div className="mt-14">
                            <StepRow steps={steps}/>
                        </div>
                    </Container>
                </section>

                {/* Quote */}
                <section id="quote" className="bg-paper py-20 sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <SectionHeader
                                eyebrow="Get a quote"
                                title="Tell us about your vehicles."
                                intro="A few details and we will come back on WhatsApp with a plan and a quote for your organisation."
                            />
                            <p className="mt-8 text-ink/60">
                                Rather talk it through?{' '}
                                <a
                                    href={whatsappUrl("Hi Jaranow! I'd like to talk about car washing for our organisation.")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary-600 underline underline-offset-4"
                                >
                                    Message us on WhatsApp
                                </a>
                                .
                            </p>
                        </div>
                        <div className="lg:col-span-7">
                            <WhatsAppForm
                                fields={quoteFields}
                                intro="Hi Jaranow! I'd like a quote for fleet / corporate car washing."
                                submitLabel="Request a quote"
                                successTitle="Request ready to send"
                                successBody="We've opened WhatsApp with your details. Send the message and we will come back with a plan and a quote."
                                resetLabel="Start a new request"
                                footnote="We reply on WhatsApp."
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
                            intro="Anything else about washing your vehicles, ask us on WhatsApp."
                        />
                        <FaqList items={faqs} idPrefix="business-faq" className="lg:col-span-8"/>
                    </Container>
                </section>

                <CtaBand
                    title="Let's keep your vehicles clean."
                    body="Tell us how many vehicles you run and where they are, and we will put a plan together."
                >
                    <Lift>
                        <button onClick={goToQuote} className={`${btn.paper} group w-full`}>
                            Get a quote
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

export default Business;
