import React from 'react';
import {motion} from 'framer-motion';
import {ArrowRight, CalendarCheck, Clock, KeyRound, MapPin} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';
import {btn, Container, Eyebrow, FactPanel, InkBackdrop} from '../common/ui';

interface HeroProps {
    onBook?: () => void;
}

const facts = [
    {icon: <MapPin size={17}/>, label: 'Where', value: '6th Avenue, Gwarinpa, Abuja'},
    {icon: <Clock size={17}/>, label: 'When', value: 'Open daily, 8am–7pm'},
    {icon: <CalendarCheck size={17}/>, label: 'Booking', value: 'No appointment needed - just drive in'},
    {icon: <KeyRound size={17}/>, label: 'Your car', value: 'Professionally cared for and washed properly'},
];

const Hero: React.FC<HeroProps> = ({onBook}) => {
    return (
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
                        <motion.div variants={fadeInUp}>
                            <Eyebrow tone="dark">Carwash by Jaranow · Gwarinpa</Eyebrow>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="heading-display mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl"
                        >
                            Your car, handled<span className="text-primary-600">.</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
                            Drive in, we wash it by hand, you drive off. A team trained to look twice, and a car that is
                            checked before the keys go back in your hand.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
                            <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                                <button onClick={onBook} className={`${btn.primary} group w-full`}>
                                    Book a wash
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                                </button>
                            </motion.div>
                            <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                                <a href="#pricing" className={`${btn.ghostOnDark} w-full`}>
                                    See the washes
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>

                    <motion.div variants={fadeInUp} className="lg:col-span-5">
                        <FactPanel facts={facts}/>
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
};

export default Hero;
