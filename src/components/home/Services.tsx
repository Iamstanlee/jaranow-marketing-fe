import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';

interface Track {
    id: string;
    line: string;
    headline: string;
    summary: string;
    steps: Array<{ title: string; body: string }>;
    detailsTo: string;
    detailsLabel: string;
    pricingTo: string;
}

const tracks: Track[] = [
    {
        id: 'carwash',
        line: 'Carwash by Jaranow',
        headline: 'A hand wash, while you wait.',
        summary: '6th Avenue, Gwarinpa. Open daily, 8am–7pm.',
        steps: [
            {
                title: 'Drive in',
                body: 'No appointment needed. If you would rather know we are ready for you, book ahead on WhatsApp.',
            },
            {
                title: 'We wash by hand',
                body: 'Exterior, full or vacuum wash - you choose. Your car stays where you parked it.',
            },
            {
                title: 'Checked, then yours',
                body: 'We go over it once more before you get the keys back. Pay by transfer once the wash is done.',
            },
        ],
        detailsTo: '/carwash',
        detailsLabel: 'Book a car wash',
        pricingTo: '/pricing?service=carwash',
    },
    {
        id: 'laundry',
        line: 'Laundry by Jaranow',
        headline: 'Laundry that leaves the house, and comes back done.',
        summary: 'Monthly plans, collected and delivered across Abuja.',
        steps: [
            {
                title: 'Pick a plan',
                body: 'Lite or Premium, depending on how much your household goes through in a month.',
            },
            {
                title: 'We collect',
                body: 'On your pickup days - Tuesday and Saturday, with Thursday added on Premium.',
            },
            {
                title: 'Back in 48 hours',
                body: 'Washed, dried, ironed and folded. Every item is checked before it leaves us.',
            },
        ],
        detailsTo: '/laundry',
        detailsLabel: 'Start a laundry plan',
        pricingTo: '/pricing?service=wash',
    },
];

const Services: React.FC = () => {
    return (
        <section id="services" className="bg-white py-20 sm:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary-600">How it works</p>
                    <h2 className="heading-display mt-4 text-4xl leading-[1.05] text-ink sm:text-5xl">
                        Three steps, either way.
                    </h2>
                </div>

                <div className="mt-14 grid gap-6 lg:grid-cols-2">
                    {tracks.map((track) => (
                        <article
                            key={track.id}
                            aria-labelledby={`track-${track.id}`}
                            className="flex flex-col rounded-3xl border border-ink/10 bg-paper/60 p-7 sm:p-10"
                        >
                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary-600">
                                {track.line}
                            </p>
                            <h3 id={`track-${track.id}`} className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                {track.headline}
                            </h3>
                            <p className="mt-2 text-ink/60">{track.summary}</p>

                            <ol className="mt-8 flex-1 space-y-6 border-t border-ink/10 pt-8">
                                {track.steps.map((step, index) => (
                                    <li key={step.title} className="flex gap-5">
                                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ink text-sm font-medium text-white tabular-nums">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-bold text-ink">{step.title}</p>
                                            <p className="mt-1 leading-relaxed text-ink/65">{step.body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>

                            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                                <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                                    <Link
                                        to={track.detailsTo}
                                        className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600"
                                    >
                                        {track.detailsLabel}
                                        <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5"/>
                                    </Link>
                                </motion.div>
                                <Link
                                    to={track.pricingTo}
                                    className="font-medium text-ink/70 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-primary-600 hover:decoration-primary-600"
                                >
                                    See prices
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
