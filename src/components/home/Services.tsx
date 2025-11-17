import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight, DollarSign, MapPin, Shirt, Truck} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';

interface ServiceCardProps {
    title: string;
    description: string;
    features: Array<{ icon: React.ReactNode; text: string }>;
    link: string;
    gradient: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
                                                     title,
                                                     description,
                                                     features,
                                                     link,
                                                     gradient,
                                                 }) => {
    return (
        <motion.div variants={fadeInUp}>
            <Link to={link} className="block group">
                <div
                    className={`relative h-full bg-gradient-to-br ${gradient} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                            backgroundSize: '30px 30px'
                        }}></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Title */}
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            {title}
                        </h3>

                        {/* Description */}
                        <p className="text-white/90 text-lg mb-6 leading-relaxed">
                            {description}
                        </p>

                        {/* Features */}
                        <div className="space-y-3 mb-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {feature.icon}
                                    </div>
                                    <span className="text-white/90">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div
                            className="flex items-center space-x-2 text-white font-semibold group-hover:translate-x-2 transition-transform">
                            <span>Learn More</span>
                            <ArrowRight size={20}/>
                        </div>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            </Link>
        </motion.div>
    );
};

const Services: React.FC = () => {
    const services: ServiceCardProps[] = [
        {
            title: '10-Minute Delivery',
            description: 'Lightning-fast grocery delivery powered by AI. Order with your voice or camera.',
            features: [
                {
                    icon: <Truck size={18} className="text-yellow-400"/>,
                    text: 'Delivered in 10 minutes or less'
                },
                {
                    icon: <MapPin size={18} className="text-yellow-400"/>,
                    text: 'Available in Gwarinpa, Abuja'
                },
                {
                    icon: <DollarSign size={18} className="text-yellow-400"/>,
                    text: '₦1,500 (delivery fee + service)'
                }
            ],
            link: '/delivery',
            gradient: 'from-primary-500 via-primary-600 to-primary-700',
        },
        {
            title: 'Premium Laundry',
            description: 'Subscription-based laundry service with doorstep pickup and delivery.',
            features: [
                {
                    icon: <Shirt size={18} className="text-blue-200"/>,
                    text: 'Wash, dry, iron & fold included'
                },
                {
                    icon: <Truck size={18} className="text-blue-200"/>,
                    text: 'Doorstep pickup & delivery'
                },
                {
                    icon: <DollarSign size={18} className="text-blue-200"/>,
                    text: 'From ₦15,999/month'
                }
            ],
            link: '/wash',
            gradient: 'from-blue-500 via-blue-600 to-blue-700',
        }
    ];

    return (
        <section id="services" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{once: true, margin: "-100px"}}
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Our Services
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the convenience that fits your lifestyle. More services coming soon!
                        </p>
                    </motion.div>

                    {/* Service Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {services.map((service, index) => (
                            <ServiceCard key={index} {...service} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Services;
