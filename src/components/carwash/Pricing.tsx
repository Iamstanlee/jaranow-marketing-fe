import React from 'react';
import {Car, Check, Sparkles, Wind, Gem} from 'lucide-react';

interface WashOption {
    name: string;
    price: string;
    tagline: string;
    includes: string[];
    icon: React.ReactNode;
    featured?: boolean;
}

interface PricingProps {
    onBook?: (washType: string) => void;
}

const Pricing: React.FC<PricingProps> = ({onBook}) => {
    const options: WashOption[] = [
        {
            name: 'Exterior Wash',
            price: '₦2,000',
            tagline: 'A clean, gleaming outside - quick and thorough.',
            includes: [
                'Full exterior hand wash',
                'Wheels & tyres cleaned',
                'Windows & mirrors wiped down',
                'Dried and finished by hand',
            ],
            icon: <Car size={28} className="text-primary-700"/>,
        },
        {
            name: 'Full Wash',
            price: '₦3,000',
            tagline: 'Interior + exterior. Inside and out, spotless.',
            includes: [
                'Everything in the Exterior Wash',
                'Interior vacuum & wipe down',
                'Dashboard & console cleaned',
                'Mats cleaned and refreshed',
            ],
            icon: <Sparkles size={28} className="text-cyan-600"/>,
            featured: true,
        },
        {
            name: 'Vacuum Wash',
            price: '₦4,000',
            tagline: 'A full exterior wash with a deep interior vacuum.',
            includes: [
                'Full exterior hand wash',
                'Interior machine-vacuumed throughout',
                'Seats, carpets & boot cleaned out',
                'Dashboard & console wiped down',
            ],
            icon: <Wind size={28} className="text-primary-700"/>,
        },
        {
            name: 'Buffing',
            price: '₦20,000',
            tagline: 'A full wash, then paintwork machine-polished.',
            includes: [
                'Everything in the Full Wash',
                'Paintwork machine-polished',
                'Gloss restored, light swirls removed',
                'Finished and inspected by hand',
            ],
            icon: <Gem size={28} className="text-primary-700"/>,
        },
    ];

    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="text-center mb-6">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Choose your wash
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Four ways to have your car cared for. Every one washed by hand and
                            finished to the same standard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
                        {options.map((option) => (
                            <div key={option.name} className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                                    option.featured
                                        ? 'bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-2xl'
                                        : 'bg-gray-50 border border-gray-200 shadow-lg'
                                }`}>
                                {option.featured && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-cyan-400 text-primary-900 px-5 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                            Most popular
                                        </span>
                                    </div>
                                )}

                                <div
                                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                                        option.featured ? 'bg-white' : 'bg-white shadow-sm'
                                    }`}
                                >
                                    {option.icon}
                                </div>

                                <h3 className={`text-2xl font-bold mb-2 ${option.featured ? 'text-white' : 'text-gray-900'}`}>
                                    {option.name}
                                </h3>
                                <p className={`mb-6 ${option.featured ? 'text-white/80' : 'text-gray-600'}`}>
                                    {option.tagline}
                                </p>

                                <div className="mb-8">
                                    <span className={`text-5xl font-bold ${option.featured ? 'text-cyan-300' : 'text-primary-700'}`}>
                                        {option.price}
                                    </span>
                                    <span className={`ml-2 ${option.featured ? 'text-white/70' : 'text-gray-500'}`}>
                                        / wash
                                    </span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {option.includes.map((item, i) => (
                                        <li key={i} className="flex items-start">
                                            <Check
                                                className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                                                    option.featured ? 'text-cyan-300' : 'text-green-500'
                                                }`}
                                            />
                                            <span className={option.featured ? 'text-white/90' : 'text-gray-700'}>
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => onBook?.(option.name)}
                                    className={`mt-auto w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                                        option.featured
                                            ? 'bg-cyan-400 hover:bg-cyan-300 text-primary-900'
                                            : 'bg-primary-700 hover:bg-primary-800 text-white'
                                    }`}
                                >
                                    Book {option.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-gray-500 mt-10 text-sm">
                        Washed by hand · Checked before you drive off · Your keys stay with you
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
