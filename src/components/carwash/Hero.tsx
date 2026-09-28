import React from 'react';
import {motion} from 'framer-motion';
import {ArrowRight, CalendarCheck, Clock, MapPin, Sparkles} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';
import {btn, Container, FactPanel, HeroTitle, InkBackdrop} from '../common/ui';

interface HeroProps {
    onBook?: () => void;
}

const facts = [
    {icon: <MapPin size={17}/>, label: 'Where', value: '6th Avenue, Gwarinpa, Abuja'},
    {icon: <Clock size={17}/>, label: 'When', value: 'Open every day, 8am–7pm'},
    {icon: <CalendarCheck size={17}/>, label: 'Booking', value: 'Book ahead on WhatsApp or the form below'},
    {icon: <Sparkles size={17}/>, label: 'You get', value: 'A clean, fresh car, ready to go'},
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
                        <HeroTitle kicker="Car wash in Gwarinpa, Abuja">
                            Your car, handled<span className="text-primary-600">.</span>
                        </HeroTitle>

                        <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
                            Drive in at 6th Avenue and we wash your car while you wait - outside, inside, or both.
                            You drive off in a car that is clean, fresh and ready to be seen in.
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
                                    See the washes and prices
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
