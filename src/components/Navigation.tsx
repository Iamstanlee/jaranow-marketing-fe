import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {scrollToElement} from '../utils/formatters';

interface NavigationProps {
    onJoinWaitlist: () => void;
}

const Navigation: React.FC<NavigationProps> = ({onJoinWaitlist}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        {name: 'How It Works', href: '#how-it-works'},
        {name: 'Pricing', href: '#pricing'},
        {name: 'FAQ', href: '#faq'},
    ];

    const handleNavClick = (href: string) => {
        if (href.startsWith('#')) {
            scrollToElement(href.substring(1));
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/90 backdrop-blur-md shadow-lg'
                    : 'bg-transparent'
            }`}
            initial={{y: -100}}
            animate={{y: 0}}
            transition={{duration: 0.6}}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <motion.div
                        className="flex-shrink-0"
                        whileHover={{scale: 1.05}}
                        transition={{type: "spring", stiffness: 300}}
                    >
                        <img src={isScrolled ? "/logo.png" : "/logo1.png"} className="h-16 p-2"/>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            {navItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavClick(item.href)}
                                    className={`px-3 py-2 text-sm font-medium transition-colors duration-300 hover:text-primary-600 ${
                                        isScrolled ? 'text-gray-700' : 'text-white'
                                    }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <motion.button
                            onClick={onJoinWaitlist}
                            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                                isScrolled
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                                    : 'bg-yellow-400 hover:bg-yellow-500 text-primary-900'
                            }`}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                        >
                            Join Waitlist
                        </motion.button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-2 rounded-md transition-colors duration-300 ${
                                isScrolled
                                    ? 'text-gray-700 hover:text-primary-600'
                                    : 'text-white hover:text-yellow-400'
                            }`}
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 6h16M4 12h16M4 18h16"/>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <motion.div
                    className="md:hidden bg-white shadow-lg"
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -20}}
                    transition={{duration: 0.2}}
                >
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => handleNavClick(item.href)}
                                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors duration-300"
                            >
                                {item.name}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                onJoinWaitlist();
                                setIsMobileMenuOpen(false);
                            }}
                            className="block w-full text-left px-3 py-2 text-base font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-md transition-colors duration-300"
                        >
                            Join Waitlist
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navigation;