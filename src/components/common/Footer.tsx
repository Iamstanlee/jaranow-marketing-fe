import React from 'react';
import {Link} from 'react-router-dom';
import {Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter} from 'lucide-react';

const phoneNumber = '2349038622012';
const displayPhone = '+234 903 862 2012';

const socialLinks = [
    {name: 'Instagram', icon: <Instagram className="w-5 h-5"/>, href: 'https://instagram.com/jara_now'},
    {name: 'Twitter', icon: <Twitter className="w-5 h-5"/>, href: 'https://twitter.com/jara_now'},
    {name: 'Facebook', icon: <Facebook className="w-5 h-5"/>, href: 'https://facebook.com/jaranow'},
    {name: 'LinkedIn', icon: <Linkedin className="w-5 h-5"/>, href: 'https://linkedin.com/company/jaranow'},
];

const serviceLinks = [
    {name: 'Car Wash', to: '/carwash'},
    {name: 'Laundry Service', to: '/laundry'},
    {name: 'Pricing', to: '/pricing'},
];

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <img src="/brand/jaranow-logo-white.svg" alt="Jaranow - Convenience as a Service" className="h-12 w-auto mb-5"/>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Convenience as a Service. From fixed-price car washing to premium laundry care,
                            Jaranow brings convenience to your day.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                                    aria-label={link.name}
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Services</h3>
                        <ul className="space-y-2">
                            {serviceLinks.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.to} className="text-gray-400 hover:text-white transition-colors duration-300">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">
                                    All Services
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Get in touch</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li>
                                <a href={`tel:+${phoneNumber}`} className="flex items-center space-x-3 hover:text-white transition-colors">
                                    <Phone className="w-5 h-5 flex-shrink-0 text-cyan-400"/>
                                    <span>{displayPhone}</span>
                                </a>
                            </li>
                            <li>
                                <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center space-x-3 hover:text-white transition-colors">
                                    <svg className="w-5 h-5 flex-shrink-0 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <span>WhatsApp</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@jaranow.com" className="flex items-center space-x-3 hover:text-white transition-colors">
                                    <Mail className="w-5 h-5 flex-shrink-0 text-cyan-400"/>
                                    <span>support@jaranow.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Visit us */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Visit us</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 flex-shrink-0 text-cyan-400"/>
                                <span>6th Avenue, Gwarinpa, Abuja</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 flex-shrink-0 text-cyan-400"/>
                                <span>Open daily · 8:00 AM – 7:00 PM</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-3">
                        <div>© 2025 Jaranow Technologies Limited. All rights reserved.</div>
                        <div className="flex items-center space-x-2">
                            <span>Part of the Jaranow family</span>
                            <span>·</span>
                            <span>Made with ❤️ in Nigeria</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
