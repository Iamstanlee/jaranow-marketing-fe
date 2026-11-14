import React from 'react';
import {Helmet} from 'react-helmet-async';
import {motion} from 'framer-motion';
import {ArrowRight, Banknote, Briefcase, Clock, MapPin} from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import EnquiryForm, {type FormField, type FormValues} from '../components/common/EnquiryForm';
import {
    btn,
    Container,
    CtaBand,
    FactPanel,
    HeroTitle,
    InkBackdrop,
    Lift,
    NumberedGrid,
    SectionHeader,
    StepRow,
    whatsappUrl,
} from '../components/common/ui';
import {AREAS, APPLICATION_FIELDS, EXPERIENCE, FULL_DAY, SOURCES, START} from '../data/hiring';
import {COLLECTIONS} from '../book/constants';
import {fadeInUp, staggerContainer} from '../utils/animations';
import {scrollToElement} from '../utils/formatters';
import {useLandingScroll} from '../utils/useLandingScroll';
import SeoTags from '../seo/SeoTags';

// Pay and hours match the recruitment poster (brand/gen-poster.js JOBS); never print an unconfirmed one.
const facts = [
    {icon: <Briefcase size={17}/>, label: 'Role', value: 'Car wash attendant · Full-time'},
    {icon: <MapPin size={17}/>, label: 'Where', value: '6th Avenue, Gwarinpa, Abuja'},
    {icon: <Clock size={17}/>, label: 'Hours', value: '5–6 days a week, 8am–7pm'},
    {icon: <Banknote size={17}/>, label: 'Salary', value: '₦50,000 – ₦70,000 a month'},
];

const qualities = [
    {
        title: 'Sharp eyes',
        body: 'You see the soap mark on the glass and the dust inside the door, and you go back for it without anyone telling you.',
    },
    {
        title: 'You keep time',
        body: 'You resume on time every day you are on duty. The whole team plans around you.',
    },
    {
        title: 'Honest, always',
        body: "Customers trust us with their cars and everything inside them. You leave a customer's things exactly as you found them.",
    },
    {
        title: 'Strong and willing',
        body: 'The work is active, on your feet and in the sun. If you have washed cars before, good. If not, we will teach you.',
    },
];

const steps = [
    {title: 'Apply on your phone', body: 'Answer seven short questions below. It takes about two minutes.'},
    {title: 'We call you', body: 'If you are a good fit, we call or WhatsApp you on the number you give us.'},
    {title: 'Two days of training', body: 'Work beside the team at 6th Avenue for two days. You see the real job, and we see how you work.'},
    {title: 'Resume work', body: 'Join the team on a monthly salary.'},
];

const fields: FormField[] = [
    {name: 'name', label: 'Full name', type: 'text', placeholder: 'Your full name', required: true},
    {name: 'phone', label: 'Phone number (WhatsApp, if you have it)', type: 'tel', placeholder: 'e.g. 0803 123 4567', required: true},
    {name: 'area', label: 'Where do you stay?', type: 'select', options: AREAS, required: true},
    {name: 'start', label: 'When can you resume?', type: 'select', options: START, required: true},
    {name: 'experience', label: 'Have you washed cars before?', type: 'select', options: EXPERIENCE, required: true},
    {name: 'fullDay', label: 'Can you work 5–6 days a week, 8am to 7pm?', type: 'select', options: FULL_DAY, required: true},
    {name: 'source', label: 'How did you hear about this job?', type: 'select', options: SOURCES, required: true, full: true},
];

// The link they came in on (?src=qrcode), kept apart from what they say in `source`.
const campaign = () => {
    const src = new URLSearchParams(window.location.search).get('src') || '';
    return src.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
};

const apply = async (values: FormValues) => {
    // Loaded on submit so browsing the page never pulls in Firebase.
    const [{db, authReady}, {addDoc, collection, serverTimestamp}] = await Promise.all([
        import('../lib/firebase'),
        import('firebase/firestore'),
    ]);
    if (!db) throw new Error('Firebase is not configured');
    await authReady;
    const src = campaign();
    await addDoc(collection(db, COLLECTIONS.applicants), {
        ...Object.fromEntries(APPLICATION_FIELDS.map((key) => [key, values[key]])),
        ...(src ? {src} : {}),
        stage: 'new',
        createdAt: serverTimestamp(),
    });
};

const whatsappApplication = (values: FormValues) =>
    whatsappUrl(
        `Hi Jaranow! I'd like to apply for the car wash attendant job.\n\n${fields
            .filter((f) => values[f.name]?.trim())
            .map((f) => `${f.label} ${values[f.name].trim()}`)
            .join('\n')}`,
    );

const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    'Carwash by Jaranow is hiring car wash attendants at 6th Avenue, Gwarinpa. Monthly salary, two days of training, no CV needed. Apply here: https://jaranow.com/careers?src=share',
)}`;

const Careers: React.FC = () => {
    useLandingScroll();
    const goToApply = () => scrollToElement('apply');

    return (
        <div className="min-h-screen bg-paper">
            <SeoTags route="/careers"/>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'JobPosting',
                        title: 'Car wash attendant',
                        description:
                            '<p>Carwash by Jaranow is hiring full-time car wash attendants at 6th Avenue, Gwarinpa, Abuja. Attendants work 5–6 days a week, 8am–7pm, on a monthly salary. New starters train for two days beside the team.</p><p>We look for sharp eyes, good timekeeping and honesty. Experience washing cars helps but is not required. No CV needed, and applying is free.</p>',
                        datePosted: '2026-11-14',
                        employmentType: 'FULL_TIME',
                        directApply: true,
                        hiringOrganization: {
                            '@type': 'Organization',
                            name: 'Jaranow',
                            sameAs: 'https://jaranow.com',
                            logo: 'https://jaranow.com/brand/jaranow-symbol.svg',
                        },
                        jobLocation: {
                            '@type': 'Place',
                            address: {
                                '@type': 'PostalAddress',
                                streetAddress: '6th Avenue, Gwarinpa',
                                addressLocality: 'Abuja',
                                addressRegion: 'FCT',
                                addressCountry: 'NG',
                            },
                        },
                        baseSalary: {
                            '@type': 'MonetaryAmount',
                            currency: 'NGN',
                            value: {'@type': 'QuantitativeValue', minValue: 50000, maxValue: 70000, unitText: 'MONTH'},
                        },
                    })}
                </script>
            </Helmet>

            <Header logo="carwash" ctaLabel="Apply now" onCtaClick={goToApply}/>

            <main>
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
                                <HeroTitle kicker="Car wash jobs in Gwarinpa, Abuja">
                                    Join a team that looks twice<span className="text-primary-600">.</span>
                                </HeroTitle>
                                <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
                                    Full-time work at 6th Avenue, Gwarinpa, on a monthly salary. No CV needed - apply
                                    from your phone.
                                </motion.p>
                                <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
                                    <Lift>
                                        <button onClick={goToApply} className={`${btn.primary} group w-full`}>
                                            Apply now
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                                        </button>
                                    </Lift>
                                    <Lift>
                                        <a href="#how-it-works" className={`${btn.ghostOnDark} w-full`}>
                                            How hiring works
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

                <section className="bg-white py-20 sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <SectionHeader
                            className="lg:col-span-4"
                            eyebrow="Who we're looking for"
                            title="We hire for character. We train the rest."
                            intro="Every car that leaves 6th Avenue carries our name. If you take your work seriously, we want to meet you."
                        />
                        <NumberedGrid items={qualities} className="lg:col-span-8"/>
                    </Container>
                </section>

                <section id="how-it-works" className="bg-paper py-20 sm:py-28">
                    <Container>
                        <SectionHeader
                            eyebrow="How hiring works"
                            title="From application to your first day."
                            className="max-w-2xl"
                        />
                        <div className="mt-14">
                            <StepRow steps={steps}/>
                        </div>
                    </Container>
                </section>

                <section id="apply" className="bg-white py-20 sm:py-28">
                    <Container className="grid gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                            <SectionHeader
                                eyebrow="Car wash attendant · Gwarinpa"
                                title="Apply in two minutes."
                                intro="Applying is free. Jaranow will never ask you to pay money to get this job."
                            />
                            <p className="mt-8 text-ink/60">
                                Questions about the job?{' '}
                                <a
                                    href={whatsappUrl("Hi Jaranow! I have a question about the car wash attendant job.")}
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
                            <EnquiryForm
                                fields={fields}
                                onSubmit={apply}
                                submitLabel="Send my application"
                                successTitle="We have your application"
                                successBody="Thank you. Keep your phone close - if you are a good fit, we will call or WhatsApp you."
                                resetLabel="Send another application"
                                footnote="We use your details only to contact you about jobs at Jaranow."
                                failure={(values) => (
                                    <>
                                        Your application did not send. Check your connection and try again, or{' '}
                                        <a href={whatsappApplication(values)} target="_blank" rel="noopener noreferrer"
                                           className="font-medium underline underline-offset-4">
                                            apply on WhatsApp
                                        </a>
                                        .
                                    </>
                                )}
                            />
                        </div>
                    </Container>
                </section>

                <CtaBand
                    title="Know someone who needs a good job?"
                    body="Send them this page on WhatsApp. They can apply from their phone in two minutes."
                >
                    <Lift>
                        <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={`${btn.paper} w-full`}>
                            Share on WhatsApp
                        </a>
                    </Lift>
                    <Lift>
                        <button onClick={goToApply} className={`${btn.ghostOnAccent} w-full`}>
                            Apply yourself
                        </button>
                    </Lift>
                </CtaBand>
            </main>

            <Footer/>
        </div>
    );
};

export default Careers;
