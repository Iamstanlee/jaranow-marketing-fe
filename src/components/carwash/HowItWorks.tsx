import React from 'react';
import {Car, Droplets, KeyRound} from 'lucide-react';

interface Step {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const HowItWorks: React.FC = () => {
    const steps: Step[] = [
        {
            number: '01',
            icon: <Car size={32} className="text-white"/>,
            title: 'Drive in',
            description: 'Roll up to our spot on 6th Avenue, Gwarinpa. No appointment needed - pick your wash and we take it from there.',
        },
        {
            number: '02',
            icon: <Droplets size={32} className="text-white"/>,
            title: 'We wash',
            description: 'Our trained team cleans your car by hand - inside, outside, or both. You relax while we do the work.',
        },
        {
            number: '03',
            icon: <KeyRound size={32} className="text-white"/>,
            title: 'Pay & drive off',
            description: 'Pay the fixed price to our Jaranow business account, hop back in, and drive off spotless.',
        },
    ];

    return (
        <section id="how-it-works" className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            How it works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Three simple steps. That's all it takes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                                <span className="absolute top-6 right-6 text-5xl font-bold text-gray-100 select-none">
                                    {step.number}
                                </span>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mb-6">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
