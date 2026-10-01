import React from 'react';
import {btn, Lift, openWhatsApp} from '../common/ui';
import {CARWASH_PRICE_LIST} from '../../data/carwashPrices';
import {formatCurrency} from '../../utils/formatters';
import {trackLead} from '../../utils/metaPixel';

/* The rug size cards, shared by /rugs and the Rug wash tab on /pricing so the
   two can never quote different figures or book differently. Prices come from
   the Rug section of the printed price list data. */

export const RUGS = CARWASH_PRICE_LIST.find((s) => s.title === 'Rug')?.items ?? [];

/** Opens WhatsApp with the chosen size - a Lead, like every price-card button. */
export const bookRug = (name: string, price: number) => {
    trackLead(`Price card - ${name}`);
    openWhatsApp(`Hi Jaranow! I'd like to book a rug pickup.\n\nRug: ${name} (${formatCurrency(price)})`);
};

/** Three cards, small to large; the largest is set on Ink rather than badged. */
const RugPrices: React.FC = () => (
    <div className="grid gap-6 lg:grid-cols-3">
        {RUGS.map((r, i) => {
            const dark = i === RUGS.length - 1;
            return (
                <Lift key={r.name} className="h-full">
                    <article
                        className={`flex h-full flex-col rounded-3xl p-8 sm:p-9 ${
                            dark ? 'bg-ink text-white' : 'border border-ink/10 bg-white'
                        }`}
                    >
                        <h3 className={`text-2xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>{r.name}</h3>
                        <p className={`mt-2 ${dark ? 'text-paper/65' : 'text-ink/60'}`}>{r.note}</p>
                        <p className="mt-8 flex flex-1 items-baseline gap-2">
                            <span className={`text-5xl font-bold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
                                {formatCurrency(r.price)}
                            </span>
                            <span className={dark ? 'text-paper/55' : 'text-ink/50'}>per rug</span>
                        </p>
                        <p className={`mt-3 text-sm font-medium ${dark ? 'text-primary-400' : 'text-primary-600'}`}>
                            Free pickup &amp; delivery
                        </p>
                        <button onClick={() => bookRug(r.name, r.price)} className={`mt-8 w-full ${dark ? btn.primary : btn.ink}`}>
                            Book a {r.name.toLowerCase()} pickup
                        </button>
                    </article>
                </Lift>
            );
        })}
    </div>
);

export default RugPrices;
