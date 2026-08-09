import {useMemo, useState} from 'react';
import {PieChart} from 'lucide-react';
import {money} from '../format';
import type {Expense} from '../types';
import {Skeleton} from '../components/Skeleton';

// --- Where the money goes ----------------------------------------------------------
const RAMP = ['#0d366b', '#1c5cab', '#2a78d6', '#5598e7', '#86b6ef'];
// "Other" is the residual bucket, not a rank, so it sits outside the ramp in neutral
// slate however big it grows.
const OTHER = '#64748b';

const R = 38, STROKE = 16, CIRCUMFERENCE = 2 * Math.PI * R;
// Cut out of every arc so neighbouring slices never touch — the ring reads as parts
// rather than as one band that happens to change colour.
const GAP = 0.8;

type Slice = { category: string; amount: number; share: number; color: string; detail?: string };

function breakdown(expenses: Expense[]) {
    const total = expenses.reduce((sum, x) => sum + x.amount, 0);
    const totals = new Map<string, number>();
    for (const x of expenses) {
        const key = x.category || 'Other';
        totals.set(key, (totals.get(key) ?? 0) + x.amount);
    }
    const named = Array.from(totals).filter(([category]) => category !== 'Other').sort((a, b) => b[1] - a[1]);
    const head = named.slice(0, RAMP.length);
    // Anything past the ramp joins whatever was already filed as "Other" — a tail of
    // slivers is noise on a ring, and it is one number to the person reading it. There are
    // nine categories against five ramp steps, so this fires often: the folded names are
    // carried through and printed, because "Other ₦48,000" that will not say what it is
    // sends someone to the expense ledger to find out.
    const rest = named.slice(RAMP.length);
    const tail = rest.reduce((sum, [, amount]) => sum + amount, 0) + (totals.get('Other') ?? 0);
    const slices: Slice[] = head.map(([category, amount], i) => ({
        category,
        amount,
        share: amount / (total || 1),
        // Spread across the whole ramp rather than taking it from the dark end, so two
        // categories come out darkest-and-lightest instead of two near-identical navies.
        color: RAMP[Math.round((i * (RAMP.length - 1)) / Math.max(1, head.length - 1))]
    }));
    if (tail > 0) slices.push({
        category: 'Other',
        amount: tail,
        share: tail / (total || 1),
        color: OTHER,
        detail: rest.map(([category]) => category).join(', ') || undefined
    });
    return {slices, total};
}

const percent = (share: number) => {
    const value = share * 100;
    if (value > 0 && value < 0.1) return '<0.1%';
    return `${value.toFixed(value < 10 && value > 0 ? 1 : 0)}%`;
};

export function ExpenseBreakdown({expenses, revenue, period, loading}: {
    expenses: Expense[];
    revenue: number;
    period: string;
    loading: boolean
}) {
    const [active, setActive] = useState<number | null>(null);
    const {slices, total} = useMemo(() => breakdown(expenses), [expenses]);
    const shown = active !== null && slices[active] ? slices[active] : null;
    // The ring is drawn from true shares; only the drawn length loses the gap, so the
    // slices stay in the right places however many there are.
    let offset = 0;
    const arcs = slices.map(slice => {
        const length = slice.share * CIRCUMFERENCE, at = offset;
        offset += length;
        // A sliver thinner than the gap would otherwise draw as nothing at all, and a
        // category with no mark against its legend row reads as a bug.
        return {slice, at, length: length ? Math.max(0.8, length - GAP) : 0};
    });

    return <section aria-busy={loading} className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><PieChart/></div>
            <div><h2 className="font-bold">Where the money goes</h2><p className="text-xs text-slate-400">Expenses by
                category · {period}</p></div>
        </div>
        {loading ? <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                <Skeleton className="h-52 w-52 shrink-0 rounded-full"/>
                <div className="w-full space-y-4">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-full"/>)}</div>
            </div>
            : !total ? <p className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No expenses
                recorded in this period.</p>
                : <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10">
                    <div className="relative h-52 w-52 shrink-0">
                        {/* The ring carries no text of its own — every figure is in the list
                            beside it, which is also what a screen reader gets. */}
                        <svg aria-hidden viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                            {arcs.map(({slice, at, length}, i) => <circle key={slice.category} cx="50" cy="50" r={R}
                                                                          fill="none" stroke={slice.color}
                                                                          strokeWidth={STROKE}
                                                                          strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                                                                          strokeDashoffset={-at}
                                                                          onPointerEnter={() => setActive(i)}
                                                                          onPointerLeave={() => setActive(null)}
                                                                          className={`cursor-pointer transition-opacity ${active !== null && active !== i ? 'opacity-30' : ''}`}/>)}
                        </svg>
                        <div className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center">
                            <div>
                                <p className="text-xs text-slate-400">{shown ? shown.category : 'Total spend'}</p>
                                <p className="text-lg font-bold tabular-nums">{money(shown ? shown.amount : total)}</p>
                                {shown && <p className="text-xs font-semibold text-blue-700">{percent(shown.share)} of
                                    spend</p>}
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <ul className="space-y-1">{slices.map((slice, i) => <li key={slice.category} tabIndex={0}
                                                                                onPointerEnter={() => setActive(i)}
                                                                                onPointerLeave={() => setActive(null)}
                                                                                onFocus={() => setActive(i)}
                                                                                onBlur={() => setActive(null)}
                                                                                className={`flex min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-sm outline-offset-2 transition-colors ${active === i ? 'bg-slate-50' : ''}`}>
                            <span aria-hidden style={{background: slice.color}} className="h-3 w-3 shrink-0 rounded-sm"/>
                            <span className="min-w-0"><span
                                className={`block truncate ${i === 0 ? 'font-semibold' : ''}`}>{slice.category}</span>
                                {slice.detail && <span title={slice.detail}
                                                       className="block truncate text-xs text-slate-400">{slice.detail}</span>}</span>
                            <span className="ml-auto shrink-0 tabular-nums font-semibold">{money(slice.amount)}</span>
                            <span
                                className="w-12 shrink-0 text-right tabular-nums text-slate-400">{percent(slice.share)}</span>
                        </li>)}</ul>
                        {revenue > 0 && <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                            Expenses took <b className="text-slate-700">{percent(total / revenue)}</b> of revenue
                            in this period{slices[0] &&
                            <>, and <b className="text-slate-700">{slices[0].category.toLowerCase()}</b> alone
                                took {percent(slices[0].amount / revenue)}</>}.</p>}
                    </div>
                </div>}
    </section>;
}
