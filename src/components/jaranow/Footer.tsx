import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Smartphone, Twitter} from 'lucide-react';

interface FooterProps {
    onOrderNow: () => void;
}

const Footer: React.FC<FooterProps> = ({onOrderNow}) => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const footerLinks = {
        company: [
            {name: 'How It Works', href: '#how-it-works'},
            {name: 'Pricing', href: '#pricing'},
            {name: 'Service Areas', href: '#service-areas'}
        ],
        support: [
            {name: 'FAQ', href: '#faq'},
            {name: 'Customer Support', href: 'mailto:support@jaranow.com'},
            {name: 'Report an Issue', href: 'tel:+2349038622012'},
        ],
        legal: [
            {name: 'Privacy Policy', href: '/privacy'},
            {name: 'Terms of Service', href: '/terms'},
            {name: 'Cookie Policy', href: '/cookies'},
            {name: 'Data Protection', href: '/data-protection'}
        ]
    };

    const socialLinks = [
        {name: 'Facebook', icon: <Facebook className="w-5 h-5"/>, href: 'https://facebook.com/jaranow'},
        {name: 'Twitter', icon: <Twitter className="w-5 h-5"/>, href: 'https://twitter.com/jaranow'},
        {name: 'Instagram', icon: <Instagram className="w-5 h-5"/>, href: 'https://instagram.com/jaranow'},
        {name: 'LinkedIn', icon: <Linkedin className="w-5 h-5"/>, href: 'https://linkedin.com/company/jaranow'}
    ];

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Newsletter Section */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{duration: 0.8}}
                    viewport={{once: true}}
                    className="bg-gradient-to-r from-[#ff0023] to-red-600 rounded-2xl p-8 mb-16"
                >
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Stay Updated with Jaranow
                        </h3>
                        <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                            Get exclusive updates, early access to new areas, and special offers delivered to your
                            inbox.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white focus:outline-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-white text-[#ff0023] font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
                                >
                                    {subscribed ? 'Subscribed! ✓' : 'Subscribe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company Info */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6}}
                        viewport={{once: true}}
                        className="lg:col-span-1"
                    >
                        <img src="/logo-brand.png" alt="Jaranow - 10-minute grocery delivery service logo" className="h-14 p-2"/>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Nigeria's first 10-minute grocery delivery service. Revolutionary AI-powered shopping
                            with voice ordering, camera intelligence, and ultra-fast delivery.
                        </p>

                        <button
                            onClick={onOrderNow}
                            className="bg-[#ff0023] hover:bg-[#e6001f] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                        >
                            <Smartphone className="w-5 h-5"/>
                            <span>Order Now</span>
                        </button>
                    </motion.div>

                    {/* Company Links */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.1}}
                        viewport={{once: true}}
                    >
                        <h4 className="text-lg font-semibold mb-6">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-[#ff0023] transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Support Links */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.2}}
                        viewport={{once: true}}
                    >
                        <h4 className="text-lg font-semibold mb-6">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-gray-300 hover:text-[#ff0023] transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: 0.3}}
                        viewport={{once: true}}
                    >
                        <h4 className="text-lg font-semibold mb-6">Contact</h4>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-gray-300">
                                <Mail className="w-5 h-5 text-[#ff0023]"/>
                                <a
                                    href="mailto:support@jaranow.com"
                                    className="hover:text-[#ff0023] transition-colors duration-200"
                                >
                                    support@jaranow.com
                                </a>
                            </div>

                            <div className="flex items-center space-x-3 text-gray-300">
                                <Phone className="w-5 h-5 text-[#ff0023]"/>
                                <a
                                    href="tel:+2349038622012"
                                    className="hover:text-[#ff0023] transition-colors duration-200"
                                >
                                    +234 903 862 2012
                                </a>
                            </div>

                            <div className="flex items-start space-x-3 text-gray-300">
                                <MapPin className="w-5 h-5 text-[#ff0023] mt-0.5"/>
                                <div>
                                    <div>Abuja, Nigeria</div>
                                    <div className="text-sm">Expanding Nationwide</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Social Links */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    whileInView={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.4}}
                    viewport={{once: true}}
                    className="border-t border-gray-700 mt-12 pt-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex space-x-6 mb-6 md:mb-0">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-[#ff0023] transition-colors duration-200"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        <div className="text-center md:text-right">
                            <p className="text-gray-400 text-sm mb-2">
                                Available 24/7 for 10-minute delivery in Gwarinpa, Abuja
                            </p>
                            <div
                                className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm text-gray-500">
                                {footerLinks.legal.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className="hover:text-[#ff0023] transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <div className="mb-4 md:mb-0">
                            © 2025 Jaranow Technologies Limited. All rights reserved.
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <span>Made with ❤️ in Nigeria</span>
                            <span>•</span>
                            <span>🌱 Eco-friendly practices</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;