import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight, ArrowUpRight, Clock, MapPin, Truck} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';
import {HeroTitle, InkBackdrop} from '../common/ui';

interface ServiceEntry {
    to: string;
    line: string;
    title: string;
    facts: Array<{ icon: React.ReactNode; text: string }>;
}

const entries: ServiceEntry[] = [
    {
        to: '/carwash',
        line: 'Carwash by Jaranow',
        title: 'Drive in. Drive off clean.',
        facts: [
            {icon: <MapPin size={15}/>, text: '6th Avenue, Gwarinpa'},
            {icon: <Clock size={15}/>, text: 'Open every day, 8am–7pm'},
        ],
    },
    {
        to: '/laundry',
        line: 'Laundry by Jaranow',
        title: 'Collected. Cared for. Returned folded.',
        facts: [
            {icon: <Truck size={15}/>, text: 'Collected from your door'},
            {icon: <Clock size={15}/>, text: 'Back in 48 hours'},
        ],
    },
];

const Hero: React.FC = () => {
    return (
        <section className="relative overflow-hidden bg-ink text-white">
            <InkBackdrop/>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-40 lg:pb-28">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid gap-14 lg:grid-cols-12 lg:gap-12 lg:items-end"
                >
                    <div className="lg:col-span-7">
                        <HeroTitle kicker="Car wash in Gwarinpa · Laundry pickup across Abuja" className="text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                            Your car and laundry, handled<span className="text-primary-600">.</span>
                        </HeroTitle>

                        <motion.p
                            variants={fadeInUp}
                            className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl"
                        >
                            Get your car washed properly at 6th Avenue, Gwarinpa, open every day. Or have your laundry
                            collected from your door and returned ironed and folded within 48 hours.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                                <Link
                                    to="/carwash"
                                    className="group flex items-center justify-center gap-2 rounded-full bg-primary-600 px-7 py-4 font-medium text-white transition-colors hover:bg-primary-500"
                                >
                                    Book a car wash
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                                <Link
                                    to="/laundry"
                                    className="flex items-center justify-center gap-2 rounded-full border border-paper/25 px-7 py-4 font-medium text-white transition-colors hover:border-paper/60 hover:bg-white/5"
                                >
                                    Start a laundry plan
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Service chooser - the two ways in */}
                    <motion.div variants={fadeInUp} className="lg:col-span-5">
                        <ul className="divide-y divide-paper/10 overflow-hidden rounded-2xl border border-paper/10 bg-white/[0.03]">
                            {entries.map((entry) => (
                                <li key={entry.to}>
                                    <Link
                                        to={entry.to}
                                        className="group flex items-start justify-between gap-6 p-6 transition-colors hover:bg-white/[0.04] sm:p-7"
                                    >
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary-400">
                                                {entry.line}
                                            </p>
                                            <p className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
                                                {entry.title}
                                            </p>
                                            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/60">
                                                {entry.facts.map((fact) => (
                                                    <li key={fact.text} className="flex items-center gap-1.5">
                                                        <span className="text-primary-400">{fact.icon}</span>
                                                        {fact.text}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <span className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-paper/15 text-paper/70 transition-colors group-hover:border-primary-600 group-hover:bg-primary-600 group-hover:text-white">
                                            <ArrowUpRight size={18}/>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
