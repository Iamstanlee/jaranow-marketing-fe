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
    {to: '/carwash', label: 'Car wash'},
    {to: '/rugs', label: 'Rugs'},
    {to: '/business', label: 'Business'},
    {to: '/laundry', label: 'Laundry'},
    {to: '/pricing', label: 'Pricing'},
];

const linkClasses = (isActive: boolean) =>
    `px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300 hover:text-white ${
        isActive ? 'text-white bg-white/10' : 'text-paper/75'
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
        const classes = `${fullWidth ? 'block w-full text-center py-3' : 'py-2.5'} px-5 rounded-full font-medium text-sm bg-primary-600 hover:bg-primary-500 text-white transition-colors duration-300`;

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
                isScrolled || isMobileMenuOpen ? 'bg-ink/95 backdrop-blur border-b border-paper/10' : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex-shrink-0 flex items-center">
                        <img src={brand.src} alt={brand.alt} className={`${brand.height} w-auto`}/>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-1">
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
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="md:hidden border-t border-paper/10"
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -20}}
                        transition={{duration: 0.2}}
                    >
                        <div className="px-4 pt-3 pb-5 space-y-1">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({isActive}) =>
                                        `block px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                                            isActive ? 'bg-white/10 text-white' : 'text-paper/75 hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                            <div className="pt-3">{renderCta(true)}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Header;
