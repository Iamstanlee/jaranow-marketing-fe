import {useState} from 'react';
import {PAYMENT_METHODS} from '../constants';
import {dateOf, dayLabel, money} from '../format';
import type {Sale} from '../types';
import {Confirm} from './Confirm';
import {SELECT} from './Fields';
import {who} from './SalesTable';

// Renders nothing when no rug is owed on. `owing` is not date-filtered: a rug comes back days
// after its deposit.
export function RugBalances({owing, loading, onCollect, className = ''}: {
    owing: Sale[];
    loading: boolean;
    onCollect: (s: Sale, payment: string) => Promise<void>;
    className?: string
}) {
    const [collecting, setCollecting] = useState<Sale | null>(null), [method, setMethod] = useState('Transfer');
    if (loading || !owing.length) return null;
    const due = owing.reduce((sum, s) => sum + (s.balance ?? 0), 0);
    return <section className={`rounded-2xl border border-amber-200 bg-white ${className}`}>
        <div className="border-b border-amber-100 p-5"><h2 className="font-bold">{money(due)} to collect on delivery</h2><p
            className="text-xs text-slate-400">{owing.length} rug{owing.length === 1 ? '' : 's'} on deposit</p></div>
        <ul className="divide-y divide-slate-100">{owing.map(s => <li key={s.id}
                                                                    className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0"><p className="truncate font-medium">{who(s)}</p><p
                className="text-sm text-slate-500">{s.service} · {money(s.amount)} deposit · {dayLabel(dateOf(s))}</p></div>
            <button type="button" onClick={() => {
                setMethod('Transfer');
                setCollecting(s);
            }} className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Collect {money(s.balance ?? 0)}
            </button>
        </li>)}</ul>
        {collecting && <Confirm title="Collect the balance?" action={`Record ${money(collecting.balance ?? 0)}`}
                                detail={`${who(collecting)} · ${collecting.service} · ${money(collecting.amount)} deposit (${dayLabel(dateOf(collecting))}). This records the rest as received today.`}
                                close={() => setCollecting(null)} confirm={() => onCollect(collecting, method)}>
            <label className="mt-4 block text-sm font-medium">Paid by<select value={method}
                                                                          onChange={e => setMethod(e.target.value)}
                                                                          className={SELECT}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select></label>
        </Confirm>}
    </section>;
}
