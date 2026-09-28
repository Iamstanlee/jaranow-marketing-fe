import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Plus} from 'lucide-react';
import Drop from './Drop';
import {fadeInUp} from '../../utils/animations';

/* Shared building blocks for the marketing pages, so every page reads as one
   system: Ink and Paper grounds, Jaranow Blue as the only accent (BRAND-STANDARD §4). */

export type Tone = 'light' | 'dark';

export const WHATSAPP_NUMBER = '2349038622012';

export const whatsappUrl = (message?: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const openWhatsApp = (message: string) => {
    window.open(whatsappUrl(message), '_blank');
};

// Buttons. Pills throughout; the accent is reserved for the main action on a surface.
const btnBase =
    'inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';
export const btn = {
    primary: `${btnBase} bg-primary-600 text-white hover:bg-primary-500`,
    ink: `${btnBase} bg-ink text-white hover:bg-primary-600`,
    paper: `${btnBase} bg-paper text-ink hover:bg-white`,
    ghostOnDark: `${btnBase} border border-paper/25 text-white hover:border-paper/60 hover:bg-white/5`,
    ghostOnLight: `${btnBase} border border-ink/15 text-ink hover:border-ink/40`,
    ghostOnAccent: `${btnBase} border border-white/40 text-white hover:border-white hover:bg-white/10`,
};

/** Hover lift for buttons and cards - the only motion allowed outside hero entrances. */
export const Lift: React.FC<{ children: React.ReactNode; className?: string }> = ({children, className}) => (
    <motion.div whileHover={{y: -2}} whileTap={{scale: 0.98}} className={className}>
        {children}
    </motion.div>
);

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({children, className = ''}) => (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

/** Small all-caps label: Rubik 500, wide tracking (§6.1 - never all-caps at 400). */
export const Eyebrow: React.FC<{ children: React.ReactNode; tone?: Tone; className?: string }> = ({
    children,
    tone = 'light',
    className = '',
}) => (
    <p
        className={`text-xs font-medium uppercase tracking-[0.25em] ${
            tone === 'dark' ? 'text-primary-400' : 'text-primary-600'
        } ${className}`}
    >
        {children}
    </p>
);

interface SectionHeaderProps {
    eyebrow: string;
    title: React.ReactNode;
    intro?: React.ReactNode;
    tone?: Tone;
    className?: string;
}

/** Eyebrow + Archivo Black heading + optional intro. One display line per screen (§6.2). */
export const SectionHeader: React.FC<SectionHeaderProps> = ({eyebrow, title, intro, tone = 'light', className = ''}) => (
    <div className={className}>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        <h2
            className={`heading-display mt-4 text-4xl leading-[1.05] sm:text-5xl ${
                tone === 'dark' ? 'text-white' : 'text-ink'
            }`}
        >
            {title}
        </h2>
        {intro && (
            <p className={`mt-6 max-w-xl text-lg leading-relaxed ${tone === 'dark' ? 'text-paper/70' : 'text-ink/65'}`}>
                {intro}
            </p>
        )}
    </div>
);

/** The dot field and cropped ghost drop that sit behind every Ink hero. */
export const InkBackdrop: React.FC = () => (
    <>
        <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #F2F5FB 1px, transparent 0)',
                backgroundSize: '28px 28px',
            }}
            aria-hidden="true"
        />
        <Drop className="absolute -right-40 top-10 h-[720px] w-auto text-paper opacity-[0.04] sm:-right-24"/>
    </>
);

/** Hero h1 for the landing pages. The kicker carries the plain search phrase
 *  ("Car wash in Gwarinpa, Abuja"); the display line carries the voice. */
export const HeroTitle: React.FC<{ kicker: string; children: React.ReactNode; className?: string }> = ({
    kicker,
    children,
    className = 'text-[2.6rem] sm:text-6xl lg:text-7xl',
}) => (
    <motion.h1 variants={fadeInUp}>
        <span className="block text-xs font-medium uppercase tracking-[0.25em] text-primary-400">{kicker}</span>
        <span className={`heading-display mt-6 block leading-[1.02] ${className}`}>{children}</span>
    </motion.h1>
);

interface PageHeroProps {
    eyebrow: string;
    title: React.ReactNode;
    intro?: React.ReactNode;
    children?: React.ReactNode;
}

/** Compact Ink band for utility pages (pricing, plan finder). Clears the fixed header. */
export const PageHero: React.FC<PageHeroProps> = ({eyebrow, title, intro, children}) => (
    <section className="relative overflow-hidden bg-ink text-white">
        <InkBackdrop/>
        <Container className="relative pt-32 pb-14 sm:pt-40 sm:pb-16">
            {/* The eyebrow is part of the h1: it carries the plain search phrase,
                the display line carries the voice. */}
            <h1>
                <span className="block text-xs font-medium uppercase tracking-[0.25em] text-primary-400">{eyebrow}</span>
                <span className="heading-display mt-5 block max-w-3xl text-[2.5rem] leading-[1.04] sm:text-6xl">{title}</span>
            </h1>
            {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">{intro}</p>}
            {children}
        </Container>
    </section>
);

/** A fact row for hero side panels: small label over a plain value. */
export interface Fact {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

export const FactPanel: React.FC<{ facts: Fact[] }> = ({facts}) => (
    <dl className="divide-y divide-paper/10 overflow-hidden rounded-2xl border border-paper/10 bg-white/[0.03]">
        {facts.map((fact) => (
            <div key={fact.label} className="flex gap-4 p-5 sm:p-6">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600/15 text-primary-400">
                    {fact.icon}
                </span>
                <div>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.2em] text-paper/50">{fact.label}</dt>
                    <dd className="mt-1 font-medium text-white">{fact.value}</dd>
                </div>
            </div>
        ))}
    </dl>
);

/** The closing blue band: one heading, one line, the actions as children.
 *  The only full accent surface on a page (§9 - accent is punctuation). */
export const CtaBand: React.FC<{ title: string; body: string; children: React.ReactNode }> = ({title, body, children}) => (
    <section className="bg-paper px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary-600 px-7 py-14 text-white sm:px-14 sm:py-20">
            <Drop className="absolute -right-16 -bottom-24 h-[420px] w-auto text-paper opacity-[0.08]"/>
            <div className="relative max-w-2xl">
                <h2 className="heading-display text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-white/85">{body}</p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">{children}</div>
            </div>
        </div>
    </section>
);

/** 2x2 numbered grid, used for the four values and anything shaped like them. */
export const NumberedGrid: React.FC<{ items: Array<{ title: string; body: string }>; tone?: Tone; className?: string }> = ({
    items,
    tone = 'light',
    className = '',
}) => {
    const dark = tone === 'dark';
    return (
        <ol
            className={`grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 ${
                dark ? 'border-paper/10 bg-paper/10' : 'border-ink/10 bg-ink/10'
            } ${className}`}
        >
            {items.map((item, index) => (
                <li key={item.title} className={`p-7 sm:p-9 ${dark ? 'bg-ink' : 'bg-paper'}`}>
                    <span className={`text-sm font-medium tabular-nums ${dark ? 'text-primary-400' : 'text-primary-600'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className={`mt-5 text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{item.title}</h3>
                    <p className={`mt-3 leading-relaxed ${dark ? 'text-paper/65' : 'text-ink/65'}`}>{item.body}</p>
                </li>
            ))}
        </ol>
    );
};

/** Numbered steps laid out across the page, joined by a rule on desktop. */
export const StepRow: React.FC<{ steps: Array<{ title: string; body: string }> }> = ({steps}) => (
    <ol className={`grid gap-10 md:gap-8 ${steps.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        {steps.map((step, index) => (
            <li key={step.title} className="relative">
                <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-ink text-sm font-medium text-white tabular-nums">
                        {index + 1}
                    </span>
                    {index < steps.length - 1 && <span className="hidden h-px flex-1 bg-ink/15 md:block" aria-hidden="true"/>}
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 max-w-xs leading-relaxed text-ink/65">{step.body}</p>
            </li>
        ))}
    </ol>
);

export interface Testimonial {
    name: string;
    role: string;
    content: string;
    tag?: string;
}

const initials = (name: string) =>
    name.split(' ').map((part) => part[0]).join('').slice(0, 2);

/** Three quotes on Ink. No star ratings - they were never verified. */
export const TestimonialGrid: React.FC<{ testimonials: Testimonial[] }> = ({testimonials}) => (
    <ul className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
            <li key={t.name}>
                <figure className="flex h-full flex-col rounded-2xl border border-paper/10 bg-white/[0.03] p-7 sm:p-8">
                    <span className="text-5xl leading-none text-primary-600" aria-hidden="true">“</span>
                    <blockquote className="mt-2 flex-1 text-lg leading-relaxed text-paper/85">{t.content}</blockquote>
                    <figcaption className="mt-8 flex items-center gap-4 border-t border-paper/10 pt-6">
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-paper/10 text-sm font-medium text-paper">
                            {initials(t.name)}
                        </span>
                        <span className="flex-1">
                            <span className="block font-medium text-white">{t.name}</span>
                            <span className="block text-sm text-paper/55">{t.role}</span>
                        </span>
                        {t.tag && (
                            <span className="rounded-full border border-paper/15 px-3 py-1 text-xs font-medium text-paper/70">
                                {t.tag}
                            </span>
                        )}
                    </figcaption>
                </figure>
            </li>
        ))}
    </ul>
);

export interface FaqItem {
    question: string;
    answer: React.ReactNode;
}

/** Accordion on a light ground. First item open by default. */
export const FaqList: React.FC<{ items: FaqItem[]; idPrefix: string; className?: string }> = ({items, idPrefix, className = ''}) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <ul className={`divide-y divide-ink/10 border-y border-ink/10 ${className}`}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                const panelId = `${idPrefix}-panel-${index}`;
                return (
                    <li key={item.question}>
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className="flex w-full items-center justify-between gap-6 py-6 text-left"
                        >
                            <span className="text-lg font-medium text-ink">{item.question}</span>
                            <Plus
                                size={20}
                                className={`flex-shrink-0 transition-transform duration-300 ${
                                    isOpen ? 'rotate-45 text-primary-600' : 'text-ink/40'
                                }`}
                            />
                        </button>
                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    id={panelId}
                                    initial={{height: 0, opacity: 0}}
                                    animate={{height: 'auto', opacity: 1}}
                                    exit={{height: 0, opacity: 0}}
                                    transition={{duration: 0.25}}
                                    className="overflow-hidden"
                                >
                                    <p className="max-w-2xl pb-6 leading-relaxed text-ink/65">{item.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </li>
                );
            })}
        </ul>
    );
};
