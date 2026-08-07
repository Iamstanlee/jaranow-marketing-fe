import {dateOf, dayLabel, money, timeLabel} from '../format';
import type {Sale} from '../types';
import {RowActions} from './RowActions';
import {Skeleton} from './Skeleton';

function Reward({sale}: { sale: Sale }) {
    if (sale.redeemed) return <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Redeemed</span>;
    if (sale.loyaltyCode && sale.loyaltyCode !== '—') return <span className="text-xs text-blue-600">+1 point</span>;
    return <span className="text-xs text-slate-300">—</span>;
}

// Phones get one card per record. Five columns cannot be read on a 390px screen, and the
// sideways scroll the table used to need hides the amount — the one figure that matters.
// The table returns at lg, where the 64-wide sidebar still leaves it room.
export function SalesTable({sales, empty = 'No sales recorded yet.', loading = false, rows = 3, onEdit, onDelete}: {
    sales: Sale[];
    empty?: string;
    loading?: boolean;
    rows?: number;
    onEdit?: (s: Sale) => void;
    onDelete?: (s: Sale) => void
}) {
    // Loading is checked before emptiness, because an unloaded ledger and an empty one look
    // identical from here and only one of them should say "no sales recorded".
    if (loading) return <SalesTableSkeleton rows={rows} actions={Boolean(onEdit)}/>;
    if (!sales.length) return <p className="px-5 py-10 text-center text-sm text-slate-400">{empty}</p>;
    return <>
        <ul className="divide-y divide-slate-100 lg:hidden">{sales.map(s => <li key={s.id} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3"><span
                className="font-medium">{s.loyaltyCode}</span><b className="shrink-0">{money(s.amount)}</b></div>
            <p className="mt-1 text-sm text-slate-500">{s.service} · {s.payment}</p>
            <div className="mt-2 flex items-center justify-between gap-3"><Reward sale={s}/>
                <div className="flex shrink-0 items-center gap-3"><span
                    className="text-xs text-slate-400">{dayLabel(dateOf(s))} · {timeLabel(dateOf(s))}</span>
                    {onEdit && <RowActions label={`${s.service} sale`} onEdit={() => onEdit(s)}
                                           onDelete={onDelete && (() => onDelete(s))}/>}</div>
            </div>
        </li>)}</ul>
        <table className="hidden w-full text-left text-sm lg:table">
            <SalesHead actions={Boolean(onEdit)}/>
            {/* Time under the day rather than in its own column: it is what tells two otherwise
                identical washes apart, and it is only ever read alongside the date. */}
            <tbody>{sales.map(s => <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dayLabel(dateOf(s))}<span
                    className="block text-xs text-slate-400">{timeLabel(dateOf(s))}</span></td>
                <td className="px-5 py-4 font-medium">{s.loyaltyCode}</td>
                <td className="px-5 py-4 text-slate-500">{s.service}</td>
                <td className="px-5 py-4 text-slate-500">{s.payment}</td>
                <td className="px-5 py-4"><Reward sale={s}/></td>
                <td className="px-5 py-4 text-right font-semibold">{money(s.amount)}</td>
                {onEdit && <td className="px-5 py-4">
                    <div className="flex justify-end"><RowActions label={`${s.service} sale`} onEdit={() => onEdit(s)}
                                                                  onDelete={onDelete && (() => onDelete(s))}/></div>
                </td>}
            </tr>)}</tbody>
        </table>
    </>
}

// Shared so the loading table and the loaded one cannot drift apart a column.
function SalesHead({actions}: { actions: boolean }) {
    return <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
    <tr>
        <th className="px-5 py-3">Date</th>
        <th className="px-5 py-3">Loyalty code</th>
        <th className="px-5 py-3">Service</th>
        <th className="px-5 py-3">Payment</th>
        <th className="px-5 py-3">Reward</th>
        <th className="px-5 py-3 text-right">Amount</th>
        {actions && <th className="px-5 py-3 text-right"><span className="sr-only">Actions</span></th>}
    </tr>
    </thead>;
}

// Mirrors both halves of SalesTable — the cards below lg, the table at and above it — so the
// layout that appears while loading is the one the records will land in.
function SalesTableSkeleton({rows, actions}: { rows: number; actions: boolean }) {
    const keys = Array.from({length: rows}, (_, i) => i);
    return <div role="status" aria-busy aria-label="Loading sales">
        <ul className="divide-y divide-slate-100 lg:hidden">{keys.map(i => <li key={i} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3"><Skeleton className="h-4 w-24"/><Skeleton
                className="h-4 w-16"/></div>
            <Skeleton className="mt-2 h-3 w-40"/>
            <Skeleton className="mt-3 h-3 w-28"/>
        </li>)}</ul>
        <table className="hidden w-full text-left text-sm lg:table">
            <SalesHead actions={actions}/>
            <tbody>{keys.map(i => <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-4"><Skeleton className="h-4 w-24"/></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-20"/></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-28"/></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-16"/></td>
                <td className="px-5 py-4"><Skeleton className="h-4 w-16"/></td>
                <td className="px-5 py-4"><Skeleton className="ml-auto h-4 w-16"/></td>
                {actions && <td className="px-5 py-4"><Skeleton className="ml-auto h-4 w-12"/></td>}
            </tr>)}</tbody>
        </table>
    </div>;
}
