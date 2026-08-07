import {useMemo} from 'react';
import {codeFor} from '../format';
import type {Loyalty} from '../types';
import {usePage} from '../hooks/usePage';
import {Pagination} from '../components/Pagination';
import {Skeleton} from '../components/Skeleton';

export function LoyaltySection({members, loading}: { members: Loyalty[]; loading: boolean }) {
    // Resolve fallback codes against the whole list before paging: codeFor() numbers by
    // position, so a page-2 slice would start counting at LOY-001 again.
    // Points are floored at 0 for display: deleting a sale whose point was already spent
    // leaves the stored balance short, and a card reading "−1 / 5 points" is not something a
    // customer holding a stamp card can be shown. See removeSale.
    const coded = useMemo(() => members.map((m, i) => ({
        ...m,
        code: codeFor(m, i),
        points: Math.max(0, m.points)
    })), [members]);
    const {slice, ...pager} = usePage(coded, undefined, 9);
    // Cards, not a spinner, and the same grid they will land in — the stamp row is the shape
    // this section is recognised by, so the skeleton keeps it.
    if (loading) return <><p className="mb-7 text-sm text-slate-500">Loyalty codes are automatically created when a sale
        is recorded for a new customer.</p>
        <div role="status" aria-busy aria-label="Loading loyalty customers"
             className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <section key={i}
                                                                                               className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-6 w-20"/>
            <div className="mt-5 flex gap-1">{[1, 2, 3, 4, 5].map(dot => <Skeleton key={dot} className="h-7 flex-1"/>)}</div>
            <Skeleton className="mt-4 h-3 w-32"/>
            <Skeleton className="mt-4 h-4 w-28"/>
        </section>)}</div>
    </>;
    return <><p className="mb-7 text-sm text-slate-500">Loyalty codes are automatically created when a sale is recorded
        for a new customer.</p>
        {!coded.length && <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">No
            loyalty customers yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{slice.map(m => <section key={m.id}
                                                                                           className="rounded-2xl border border-slate-200 bg-white p-5">
            <span
                className="inline-block rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{m.code}</span>
            <div className="mt-5 flex gap-1">{[1, 2, 3, 4, 5].map(dot => <span key={dot}
                                                                               className={`h-7 flex-1 rounded-md ${dot <= m.points ? 'bg-blue-600' : 'bg-slate-100'}`}/>)}</div>
            <div className="mt-3 flex justify-between text-xs"><span
                className="font-semibold text-blue-700">{m.points} / 5 points</span><span
                className="text-slate-400">{m.redeemed} redeemed</span></div>
        </section>)}</div>
        <Pagination {...pager} className="mt-5"/>
    </>
}
