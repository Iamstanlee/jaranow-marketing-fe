import React from 'react';
import {Check} from 'lucide-react';
import {btn, Container, Lift, SectionHeader} from '../common/ui';

export interface WashOption {
    name: string;
    price: string;
    tagline: string;
    includes: string[];
    featured?: boolean;
}

/** One wash, stated plainly. The featured card is set on Ink rather than badged. */
export const WashOptionCard: React.FC<{ option: WashOption; onBook: () => void }> = ({option, onBook}) => {
    const dark = option.featured;
    return (
        <Lift className="h-full">
            <article
                className={`flex h-full flex-col rounded-3xl p-8 sm:p-9 ${
                    dark ? 'bg-ink text-white' : 'border border-ink/10 bg-white'
                }`}
            >
                <h3 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{option.name}</h3>
                <p className={`mt-2 ${dark ? 'text-paper/65' : 'text-ink/60'}`}>{option.tagline}</p>

                <p className="mt-8 flex items-baseline gap-2">
                    <span className={`text-5xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
                        {option.price}
                    </span>
                    <span className={dark ? 'text-paper/55' : 'text-ink/50'}>per wash</span>
                </p>

                <ul className={`mt-8 flex-1 space-y-3 border-t pt-8 ${dark ? 'border-paper/10' : 'border-ink/10'}`}>
                    {option.includes.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                            <Check size={18} className={`mt-0.5 flex-shrink-0 ${dark ? 'text-primary-400' : 'text-primary-600'}`}/>
                            <span className={dark ? 'text-paper/85' : 'text-ink/75'}>{item}</span>
                        </li>
                    ))}
                </ul>

                <button onClick={onBook} className={`mt-10 w-full ${dark ? btn.primary : btn.ink}`}>
                    Book {option.name}
                </button>
            </article>
        </Lift>
    );
};

interface PricingProps {
    onBook?: (washType: string) => void;
}

const options: WashOption[] = [
    {
        name: 'Exterior Wash',
        price: '₦2,000',
        tagline: 'The outside, washed and finished by hand.',
        includes: [
            'Full exterior hand wash',
            'Wheels & tyres cleaned',
            'Windows & mirrors wiped down',
            'Dried and finished by hand',
        ],
    },
    {
        name: 'Full Wash',
        price: '₦3,000',
        tagline: 'Inside and out, cleaned properly.',
        includes: [
            'Everything in the Exterior Wash',
            'Interior vacuum & wipe down',
            'Dashboard & console cleaned',
            'Mats cleaned and refreshed',
        ],
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
    },
];

const Pricing: React.FC<PricingProps> = ({onBook}) => {
    return (
        <section id="pricing" className="bg-paper py-20 sm:py-28">
            <Container>
                <SectionHeader
                    eyebrow="The washes"
                    title="Choose your wash."
                    intro="Three ways to have your car cared for. Every one washed by hand and finished to the same standard."
                    className="max-w-2xl"
                />

                {/* Three cards: one column until lg, then three across. A 2-column
                    grid dangles the third card on its own row. */}
                <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {options.map((option) => (
                        <WashOptionCard key={option.name} option={option} onBook={() => onBook?.(option.name)}/>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default Pricing;
