import {useMemo, useState} from 'react';
import {Minus, Plus, Search, X} from 'lucide-react';
import {codeFor} from '../format';
import type {Loyalty} from '../types';
import {usePage} from '../hooks/usePage';
import {ActionMenu} from '../components/ActionMenu';
import {Confirm} from '../components/Confirm';
import {Pagination} from '../components/Pagination';
import {Skeleton} from '../components/Skeleton';

type Carded = Loyalty & { code: string };

const adjustDetail = (member: Carded, delta: number) => {
    const to = Math.max(0, member.points + delta);
    const crossing = to >= 5 && member.points < 5 ? ` That earns a free wash — ${member.code} can redeem it on the next visit.`
        : member.points >= 5 && to < 5 ? ' The free wash they had is no longer available.' : '';
    return `${member.code} goes from ${member.points} to ${to}/5 points.${crossing} No sale is recorded.`;
};

// By code ("7" = LOY-007), name, or 3+ phone digits.
const matches = (member: Carded, query: string) => {
    const q = query.trim().toLowerCase(), digits = q.replace(/\D/g, '');
    if (!q) return true;
    return member.customer.toLowerCase().includes(q)
        || member.code.toLowerCase().includes(q)
        || (!!digits && Number(member.code.replace(/\D/g, '')) === Number(digits))
        || (digits.length >= 3 && member.phone.replace(/\D/g, '').includes(digits));
};

export function LoyaltySection({members, loading, onAdjust}: {
    members: Loyalty[];
    loading: boolean;
    // Admin only.
    onAdjust?: (id: string, delta: number) => Promise<void>
}) {
    // Resolve codes before sorting or paging: codeFor numbers by position in `members`.
    // Points are floored for display, so corrections pass an id, not this copy.
    const coded = useMemo<Carded[]>(() => members.map((m, i) => ({
        ...m,
        code: codeFor(m, i),
        points: Math.max(0, m.points)
    })).sort((a, b) => Number(a.code.replace(/\D/g, '')) - Number(b.code.replace(/\D/g, ''))), [members]);
    const [query, setQuery] = useState('');
    const found = useMemo(() => coded.filter(m => matches(m, query)), [coded, query]);
    const {slice, ...pager} = usePage(found, query.trim(), 9);
    const [adjusting, setAdjusting] = useState<{ member: Carded; delta: number } | null>(null);
    const intro = <p className="mb-7 text-sm text-slate-500">A code is created when a sale is recorded for a new
        customer, and each wash earns a point.{onAdjust && ' Use a card’s menu only to correct a balance.'}</p>;
    if (loading) return <>{intro}
        <div role="status" aria-busy aria-label="Loading loyalty customers"
             className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map(i => <section key={i}
                                                                                               className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-6 w-20"/>
            <div className="mt-5 flex gap-1">{[1, 2, 3, 4, 5].map(dot => <Skeleton key={dot} className="h-7 flex-1"/>)}</div>
            <Skeleton className="mt-4 h-3 w-32"/>
            <Skeleton className="mt-4 h-4 w-28"/>
        </section>)}</div>
    </>;
    return <>{intro}
        {coded.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-3">
            <label className="relative block w-full sm:max-w-sm">
                <span className="sr-only">Search loyalty customers</span>
                <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input type="text" inputMode="search" enterKeyHint="search" value={query} onChange={e => setQuery(e.target.value)}
                       placeholder="Search by code, name or phone"
                       className="w-full rounded-xl border-slate-200 bg-white pl-9 pr-9 text-sm"/>
                {query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}
                                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <X size={15}/></button>}
            </label>
            {query.trim() && <p role="status" className="text-xs text-slate-500">{found.length} of {coded.length}</p>}
        </div>}
        {!coded.length && <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">No
            loyalty customers yet.</p>}
        {coded.length > 0 && !found.length && <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">
            No loyalty customer matches “{query.trim()}”.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{slice.map(m => <section key={m.id}
                                                                                           className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3"><span
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{m.code}</span>
                {onAdjust && <ActionMenu label={`Adjust points for ${m.code}`} items={[{
                    label: 'Add a point',
                    icon: Plus,
                    onSelect: () => setAdjusting({member: m, delta: 1})
                }, {
                    label: 'Remove a point',
                    icon: Minus,
                    tone: 'danger',
                    disabled: !m.points,
                    hint: m.points ? undefined : 'The card is empty',
                    onSelect: () => setAdjusting({member: m, delta: -1})
                }]}/>}</div>
            <div className="mt-5 flex gap-1">{[1, 2, 3, 4, 5].map(dot => <span key={dot}
                                                                               className={`h-7 flex-1 rounded-md ${dot <= m.points ? 'bg-blue-600' : 'bg-slate-100'}`}/>)}</div>
            <div className="mt-3 flex justify-between text-xs"><span
                className="font-semibold text-blue-700">{m.points} / 5 points</span><span
                className="text-slate-400">{m.redeemed} redeemed</span></div>
        </section>)}</div>
        <Pagination {...pager} className="mt-5"/>
        {adjusting && onAdjust && <Confirm
            title={adjusting.delta > 0 ? `Add a point to ${adjusting.member.code}?` : `Remove a point from ${adjusting.member.code}?`}
            detail={adjustDetail(adjusting.member, adjusting.delta)}
            action={adjusting.delta > 0 ? 'Add point' : 'Remove point'}
            tone={adjusting.delta > 0 ? 'primary' : 'danger'}
            error="Could not update this balance. Please check your connection and try again."
            close={() => setAdjusting(null)}
            confirm={() => onAdjust(adjusting.member.id, adjusting.delta)}/>}
    </>
}
