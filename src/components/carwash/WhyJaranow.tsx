import React from 'react';
import {Car, ShieldCheck, Tag, Users} from 'lucide-react';

interface Reason {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const WhyJaranow: React.FC = () => {
    const reasons: Reason[] = [
        {
            icon: <Tag size={26} className="text-cyan-600"/>,
            title: 'Fixed pricing',
            description: 'The price you see is the price you pay. No negotiation, no hidden charges, ever.',
        },
        {
            icon: <Users size={26} className="text-cyan-600"/>,
            title: 'Trained staff',
            description: 'Your car is handled by trained hands who treat every vehicle with care.',
        },
        {
            icon: <ShieldCheck size={26} className="text-cyan-600"/>,
            title: 'We ask about your valuables',
            description: 'Before every interior clean, we check with you about your valuables. Nothing is touched without your say-so.',
        },
        {
            icon: <Car size={26} className="text-cyan-600"/>,
            title: 'We never move your car',
            description: 'Your car stays exactly where you left it. We wash it in place - you keep the keys.',
        },
    ];

    return (
        <section id="why-jaranow" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Why Jaranow
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The same trust behind Jaranow grocery and laundry - now for your car.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {reasons.map((reason) => (
                            <div key={reason.title} className="flex items-start space-x-4 bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-cyan-200 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                                    {reason.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{reason.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{reason.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyJaranow;
