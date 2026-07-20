import React from 'react';
import {Clock, Heart, ShieldCheck, Sparkles} from 'lucide-react';

interface Reason {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const WhyJaranow: React.FC = () => {
    const reasons: Reason[] = [
        {
            icon: <Sparkles size={26} className="text-cyan-600"/>,
            title: 'Attention to detail',
            description: 'Washed by hand, panel by panel, by a team trained to look twice. We finish to a standard, not to a stopwatch.',
        },
        {
            icon: <Heart size={26} className="text-cyan-600"/>,
            title: 'Care',
            description: 'Your car is treated like it belongs to someone who loves it - because it does. Trained hands, the right products, no shortcuts.',
        },
        {
            icon: <Clock size={26} className="text-cyan-600"/>,
            title: 'Convenience',
            description: 'Drive in, no appointment needed. We wash it in place while you wait - you keep the keys and your car never leaves your sight.',
        },
        {
            icon: <ShieldCheck size={26} className="text-cyan-600"/>,
            title: 'Integrity',
            description: 'Before every interior clean we check with you about your valuables. Nothing is touched without your say-so, and we do exactly what we said we would.',
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
                            The same care behind Jaranow laundry - now for your car.
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
