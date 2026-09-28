import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Check, ChevronDown} from 'lucide-react';
import {btn, Container, Lift, SectionHeader, whatsappUrl} from '../common/ui';
import {formatCurrency} from '../../utils/formatters';
import {CARWASH_PRICE_LIST} from '../../data/carwashPrices';

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

/** "More prices" - the whole forecourt price list, folded away under the cards
 *  so the three everyday washes stay the first thing people see. */
export const MoreCarwashPrices: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mt-8">
            <button
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls="carwash-price-list"
                className={`${btn.ghostOnLight} group w-full sm:w-auto`}
            >
                {open ? 'Fewer prices' : 'More prices'}
                <ChevronDown size={18} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}/>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id="carwash-price-list"
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.3}}
                        className="overflow-hidden"
                    >
                        <div className="mt-6 grid gap-10 rounded-3xl border border-ink/10 bg-white p-7 sm:p-10 lg:grid-cols-12">
                            {CARWASH_PRICE_LIST.map((section) => (
                                <section
                                    key={section.title}
                                    aria-labelledby={`prices-${section.title}`}
                                    className={section.items.length > 4 ? 'lg:col-span-7' : 'lg:col-span-5'}
                                >
                                    <h3
                                        id={`prices-${section.title}`}
                                        className="border-b border-ink/10 pb-3 text-xs font-medium uppercase tracking-[0.25em] text-ink/50"
                                    >
                                        {section.title}
                                    </h3>
                                    <ul className="divide-y divide-ink/10">
                                        {section.items.map((item) => (
                                            <li key={item.name} className="flex items-baseline justify-between gap-6 py-4">
                                                <div>
                                                    <p className="font-medium text-ink">
                                                        {item.name}
                                                        {item.badge && (
                                                            <span className="ml-2 inline-block rounded-full bg-primary-600 px-2.5 py-0.5 align-middle text-[10px] font-medium uppercase tracking-[0.16em] text-white">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {item.note && <p className="mt-1 text-sm leading-relaxed text-ink/55">{item.note}</p>}
                                                </div>
                                                <p className="whitespace-nowrap text-lg font-bold tracking-tight text-ink tabular-nums">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                            <p className="text-sm text-ink/55 lg:col-span-12">
                                To book any of these,{' '}
                                <a
                                    href={whatsappUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary-600 underline underline-offset-4"
                                >
                                    message us on WhatsApp
                                </a>
                                .
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface PricingProps {
    onBook?: (washType: string) => void;
}

const options: WashOption[] = [
    {
        name: 'Exterior Wash',
        price: '₦2,000',
        tagline: 'For when the outside needs its shine back.',
        includes: [
            'Full exterior wash',
            'Wheels & tyres cleaned',
            'Windows & mirrors wiped down',
            'Dried and finished properly',
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
        tagline: 'The full exterior wash, plus a deep machine vacuum inside.',
        includes: [
            'Full exterior wash',
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
                    eyebrow="Car wash prices"
                    title="Choose your wash."
                    intro="Three washes, from a quick exterior clean to a deep interior vacuum. Whichever you pick, it gets the same care."
                    className="max-w-2xl"
                />

                {/* Three cards: one column until lg, then three across. A 2-column
                    grid dangles the third card on its own row. */}
                <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {options.map((option) => (
                        <WashOptionCard key={option.name} option={option} onBook={() => onBook?.(option.name)}/>
                    ))}
                </div>

                <MoreCarwashPrices/>
            </Container>
        </section>
    );
};

export default Pricing;
