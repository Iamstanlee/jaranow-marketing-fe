import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import Drop from '../common/Drop';

const ClosingCta: React.FC = () => {
    return (
        <section className="bg-paper px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-600 px-7 py-14 text-white sm:px-14 sm:py-20">
                <Drop className="absolute -right-16 -bottom-24 h-[420px] w-auto text-paper opacity-[0.08]"/>

                <div className="relative max-w-2xl">
                    <h2 className="heading-display text-4xl leading-[1.05] sm:text-5xl">Ready when you are.</h2>
                    <p className="mt-5 text-lg leading-relaxed text-white/85">
                        Drive in to 6th Avenue, Gwarinpa today, or message us on WhatsApp and we will set up your first laundry pickup.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                            <a
                                href="https://wa.me/2349038622012"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2 rounded-full bg-paper px-7 py-4 font-medium text-ink transition-colors hover:bg-white"
                            >
                                Message us on WhatsApp
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                            </a>
                        </motion.div>
                        <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}}>
                            <Link
                                to="/pricing"
                                className="flex items-center justify-center rounded-full border border-white/40 px-7 py-4 font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                            >
                                See all prices
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClosingCta;
