import React, {useEffect, useState} from 'react';
import {Link, NavLink} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {Menu, X} from 'lucide-react';

/** Service lines that have their own sub-brand lockup. Adding a third is one
 *  entry here plus the matching SVG in /public/brand - no layout changes. */
export type BrandLine = 'master' | 'carwash' | 'laundry';

/* Sub-brand lockups share one 625.7 x 207 frame; the master lockup is
   625.7 x 160. The heights below keep the "jaranow" wordmark the same optical
   size in every variant, so adding a service name never shrinks the master. */
const LOGOS: Record<BrandLine, { src: string; alt: string; height: string }> = {
    master: {
        src: '/brand/jaranow-logo-white.svg',
        alt: 'Jaranow - Convenience as a Service',
        height: 'h-11',
    },
    carwash: {
        src: '/brand/jaranow-carwash-white.svg',
        alt: 'Carwash by Jaranow',
        height: 'h-14',
    },
    laundry: {
        src: '/brand/jaranow-laundry-white.svg',
        alt: 'Laundry by Jaranow',
        height: 'h-14',
    },
};

export interface HeaderProps {
    /** Label for the primary call-to-action button. Defaults to "Book a wash". */
    ctaLabel?: string;
    /** If provided, the CTA becomes a button that runs this handler (e.g. scroll to a section). */
    onCtaClick?: () => void;
    /** Route the CTA links to when onCtaClick is not provided. Defaults to "/carwash". */
    ctaTo?: string;
    /** Which lockup to show. Service pages use their own; everything else the master. */
    logo?: BrandLine;
}

const navLinks = [
    {to: '/carwash', label: 'Car Wash'},
    {to: '/laundry', label: 'Laundry'},
    {to: '/pricing', label: 'Pricing'},
];

const linkClasses = (isActive: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors duration-300 hover:bg-white hover:text-primary-700 ${
        isActive ? 'bg-white/10' : ''
    }`;

const Header: React.FC<HeaderProps> = ({ctaLabel = 'Book a wash', onCtaClick, ctaTo = '/carwash', logo = 'master'}) => {
    const brand = LOGOS[logo];
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const renderCta = (fullWidth = false) => {
        const classes = `${fullWidth ? 'block w-full text-left' : ''} px-6 py-2 rounded-lg font-semibold text-sm bg-cyan-400 hover:bg-cyan-300 text-primary-900 transition-colors duration-300`;

        if (onCtaClick) {
            return (
                <button
                    onClick={() => {
                        onCtaClick();
                        setIsMobileMenuOpen(false);
                    }}
                    className={classes}
                >
                    {ctaLabel}
                </button>
            );
        }

        return (
            <Link to={ctaTo} className={classes} onClick={() => setIsMobileMenuOpen(false)}>
                {ctaLabel}
            </Link>
        );
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
                isScrolled ? 'bg-primary-900 shadow-lg' : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img src={brand.src} alt={brand.alt} className={`${brand.height} w-auto`}/>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} className={({isActive}) => linkClasses(isActive)}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:block">{renderCta()}</div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-lg text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden bg-white shadow-lg"
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.2}}
                    >
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({isActive}) =>
                                        `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                            isActive ? 'bg-gray-100 text-primary-700' : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            <div className="pt-2">{renderCta(true)}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Header;
