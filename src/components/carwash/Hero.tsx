import React from 'react';
import {motion} from 'framer-motion';
import {ArrowRight, MapPin} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';

interface HeroProps {
    onBook?: () => void;
}

const Hero: React.FC<HeroProps> = ({onBook}) => {
    return (
        <section
            className="relative min-h-svh flex items-center justify-center bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}></div>
            </div>

            {/* Soft accent glows */}
            <div className="absolute top-24 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-16 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="max-w-4xl mx-auto text-center"
                >
                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Your car, handled.{' '}
                        <span className="text-cyan-300">You don't lift a finger.</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Drive in, we wash, you drive off. Fixed prices, trained hands, no negotiation.
                    </motion.p>

                    {/* CTA */}
                    <motion.div variants={fadeInUp} className="flex justify-center mb-8">
                        <button
                            onClick={onBook}
                            className="group px-8 py-4 bg-cyan-400 text-primary-900 rounded-xl font-bold text-lg hover:bg-cyan-300 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center space-x-2"
                        >
                            <span>Book a wash</span>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </motion.div>

                    {/* Location line */}
                    <motion.div variants={fadeInUp}
                                className="inline-flex items-center space-x-2 text-white/80">
                        <MapPin size={18} className="text-cyan-300"/>
                        <span className="text-sm sm:text-base font-medium">6th Avenue, Gwarinpa, Abuja</span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
