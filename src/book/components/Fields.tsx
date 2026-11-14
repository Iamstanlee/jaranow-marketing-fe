import {money} from '../format';
import {PAYMENT_METHODS, SERVICES, type Service} from '../constants';

export const SELECT = 'mt-1 w-full rounded-xl border-slate-200';

export function ServiceField({value, onChange, disabled}: {
    value: Service;
    onChange: (v: Service) => void;
    disabled?: (s: Service) => boolean
}) {
    return <label className="block text-sm font-medium">Service<select value={value}
                                                                       onChange={e => onChange(e.target.value as Service)}
                                                                       className={SELECT}>
        {(Object.keys(SERVICES) as Service[]).map(s => <option key={s} disabled={disabled?.(s)}>{s}</option>)}
    </select></label>;
}

export function PaymentField({value, onChange}: { value: string; onChange: (v: string) => void }) {
    return <label className="block text-sm font-medium">Payment method<select value={value}
                                                                              onChange={e => onChange(e.target.value)}
                                                                              className={SELECT}>
        {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
    </select></label>;
}

// Starts at the list price; a custom amount is allowed and flagged.
export function PriceField({service, value, onChange, free = false}: {
    service: Service;
    value: string;
    onChange: (v: string) => void;
    free?: boolean
}) {
    const list = SERVICES[service], custom = !free && Number(value) !== list;
    return <label className="block text-sm font-medium">Amount (₦)
        <input required={!free} inputMode="numeric" disabled={free}
               value={free ? '0' : value} onChange={e => onChange(e.target.value)}
               className={`${SELECT} disabled:bg-slate-100 disabled:text-slate-400`}/>
        <span className="mt-1 flex items-center justify-between gap-3 text-xs font-normal">
            <span
                className={custom ? 'text-amber-600' : 'text-slate-400'}>{free ? 'Free wash — nothing to collect.' : custom ? `Custom price · standard is ${money(list)}` : 'Standard price'}</span>
            {custom && <button type="button" onClick={() => onChange(String(list))}
                               className="shrink-0 font-semibold text-blue-600">Reset</button>}
        </span>
    </label>;
}
