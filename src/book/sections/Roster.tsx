import {useMemo} from 'react';
import {BroomSparkles, Parasol} from 'lucide-react';
import {DUTIES, type Duty} from '../constants';
import {startOfWeek} from '../format';
import {nameOf, sundayOf, weekRoster, weekSpan} from '../roster';
import type {RosterEntry, Staff} from '../types';
import {Skeleton} from '../components/Skeleton';

// The rota's shared pieces: how a duty looks, and the Overview strip. The rota card itself
// (Duties) lives on the Staff page (./Staff.tsx).

// How each duty reads. Never colour alone: the icon and the word carry the difference, so a
// panel photographed and sent on WhatsApp still says which is which.
export const DUTY_STYLE: Record<Duty, { tint: string; icon: typeof BroomSparkles }> = {
    Cleaning: {tint: 'bg-blue-50 text-blue-600', icon: BroomSparkles},
    Off: {tint: 'bg-amber-50 text-amber-600', icon: Parasol}
};

// How a person's exemptions read in the team list. Empty for somebody who takes every turn,
// which is most people — a line saying "in both rotations" against every name is noise.
export const exemptionOf = (person: Staff) => {
    const out = person.exempt || [];
    if (!out.length) return '';
    if (out.length >= DUTIES.length) return 'Not in either rotation';
    return out[0] === 'Off' ? 'No Sunday-off turns' : 'No cleaning turns';
};

// The Overview strip. This week only, and read-only whoever is looking — the week walking and
// the editing live on the Staff page. It answers "who has cleaning" on the screen
// everybody opens first, which is where the question is actually asked.
export function RosterSummary({staff, roster, loading, onOpen}: {
    staff: Staff[];
    roster: RosterEntry[];
    loading: boolean;
    onOpen: () => void
}) {
    const monday = startOfWeek(new Date());
    const {cleaning, off} = useMemo(() => weekRoster(roster, staff, monday), [roster, staff, monday]);
    const line = (duty: Duty, entries: RosterEntry[]) => {
        const {tint, icon: Icon} = DUTY_STYLE[duty];
        return <div className="flex items-center gap-3">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={17}/></div>
            <div className="min-w-0"><p
                className="text-xs text-slate-400">{duty === 'Off' ? `Off · ${sundayOf(monday).toLocaleDateString('en-NG', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
            })}` : 'Cleaning · all week'}</p>
                {loading ? <Skeleton className="mt-1.5 h-4 w-28"/> : <p
                    className="truncate font-medium">{entries.length ? entries.map(e => nameOf(e, staff)).join(', ')
                    : <span className="font-normal text-slate-400">Nobody on the team</span>}</p>}</div>
        </div>;
    };
    return <section aria-busy={loading} className="mt-7 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between p-5">
            <div><h2 className="font-bold">This week’s duties</h2><p
                className="text-xs text-slate-400">{weekSpan(monday)}</p></div>
            <button onClick={onOpen} className="text-sm font-semibold text-blue-600">View staff</button>
        </div>
        <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2">
            {line('Cleaning', cleaning)}
            {line('Off', off)}
        </div>
    </section>;
}
