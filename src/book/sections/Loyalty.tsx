import {useMemo, useState} from 'react';
import {Minus, Plus} from 'lucide-react';
import {codeFor} from '../format';
import type {Loyalty} from '../types';
import {usePage} from '../hooks/usePage';
import {ActionMenu} from '../components/ActionMenu';
import {Confirm} from '../components/Confirm';
import {Pagination} from '../components/Pagination';
import {Skeleton} from '../components/Skeleton';

// A member with its code resolved — what the cards below actually render.
type Carded = Loyalty & { code: string };

// What the correction is about to do, in the terms the person holding the card cares about:
// how many stamps, and whether this is the move that earns or takes back a free wash. Points
// only ever mean anything at that boundary, so a dialog that did not name it would be asking
// about a number rather than about the thing the number buys.
const adjustDetail = (member: Carded, delta: number) => {
    const to = Math.max(0, member.points + delta);
    const crossing = to >= 5 && member.points < 5 ? ` That earns a free wash — ${member.code} can redeem it on the next visit.`
        : member.points >= 5 && to < 5 ? ' The free wash they had is no longer available.' : '';
    return `${member.code} goes from ${member.points} to ${to}/5 points.${crossing} No sale is recorded either way, so the day's takings do not change.`;
};

export function LoyaltySection({members, loading, onAdjust}: {
    members: Loyalty[];
    loading: boolean;
    // Absent for staff, so the balance is read-only unless the admin PIN is in. A point added
    // here is backed by no sale and no money, which is a different kind of write from
    // recording a wash — see adjustPoints.
    onAdjust?: (id: string, delta: number) => Promise<void>
}) {
    // Resolve fallback codes against the whole list before paging: codeFor() numbers by
    // position, so a page-2 slice would start counting at LOY-001 again.
    // Points are floored at 0 for display: deleting a sale whose point was already spent
    // leaves the stored balance short, and a card reading "−1 / 5 points" is not something a
    // customer holding a stamp card can be shown. See removeSale. The floor is why the menu
    // below sends an id rather than this member — adjustPoints has to correct against the
    // stored balance, not the one on screen.
    // Sorting happens after the map, never before: codeFor() reads the position in `members`,
    // and that same list order is what SaleModal and removeSale resolve a typed code against.
    // Reordering the input would hand a member somebody else's number.
    // Sort on the number, not the string, so LOY-9 comes before LOY-10.
    const coded = useMemo<Carded[]>(() => members.map((m, i) => ({
        ...m,
        code: codeFor(m, i),
        points: Math.max(0, m.points)
    })).sort((a, b) => Number(a.code.replace(/\D/g, '')) - Number(b.code.replace(/\D/g, ''))), [members]);
    const {slice, ...pager} = usePage(coded, undefined, 9);
    // The correction waiting to be confirmed. Everything that guards the write — the in-flight
    // state that stops a double tap, and the error if it fails — belongs to the dialog.
    const [adjusting, setAdjusting] = useState<{ member: Carded; delta: number } | null>(null);
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
        for a new customer.{onAdjust && ' Correct a balance from the card menu only when the card and the book disagree — recording the wash is what earns the point.'}</p>
        {!coded.length && <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">No
            loyalty customers yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{slice.map(m => <section key={m.id}
                                                                                           className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3"><span
                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{m.code}</span>
                {/* Admin only, and a menu rather than buttons on the face of the card: a point
                    is a free wash on its way, so it should take a deliberate look for the
                    action rather than sit under a thumb resting on a tablet. */}
                {onAdjust && <ActionMenu label={`Adjust points for ${m.code}`} items={[{
                    label: 'Add a point',
                    icon: Plus,
                    onSelect: () => setAdjusting({member: m, delta: 1})
                }, {
                    label: 'Remove a point',
                    icon: Minus,
                    tone: 'danger',
                    disabled: !m.points,
                    hint: m.points ? undefined : 'Nothing to take off — the card is empty',
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
