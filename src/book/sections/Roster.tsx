import {useMemo} from 'react';
import {type LucideIcon, HouseHeart, Construction} from 'lucide-react';
import {DUTIES, type Duty} from '../constants';
import {startOfWeek, weekdayOf} from '../format';
import {nameOf, weekRoster, weekSpan} from '../roster';
import type {RosterEntry, Staff} from '../types';
import {Skeleton} from '../components/Skeleton';

// Shared rota pieces; the full rota card is in Staff.tsx. Never colour alone — icon and word too.
export const DUTY_STYLE: Record<Duty, { tint: string; icon: LucideIcon }> = {
    Cleaning: {tint: 'bg-blue-50 text-blue-600', icon: Construction},
    Off: {tint: 'bg-amber-50 text-amber-600', icon: HouseHeart}
};

export const exemptionOf = (person: Staff) => {
    const out = person.exempt || [];
    if (!out.length) return '';
    if (out.length >= DUTIES.length) return 'Not in either rotation';
    return out[0] === 'Off' ? '' : 'No cleaning turns';
};

// Overview strip: this week, read-only.
export function RosterSummary({staff, roster, loading, onOpen}: {
    staff: Staff[];
    roster: RosterEntry[];
    loading: boolean;
    onOpen: () => void
}) {
    const monday = startOfWeek(new Date());
    const {cleaning, off} = useMemo(() => weekRoster(roster, staff, monday), [roster, staff, monday]);
    // "Mon Ade, Bola · Tue Chidi": one group per day, in the order the days fall.
    const byDay = (entries: RosterEntry[]) => Array.from(entries.reduce((days, e) =>
        days.set(e.day, [...(days.get(e.day) || []), nameOf(e, staff)]), new Map<string, string[]>()))
        .map(([day, names]) => `${weekdayOf(day)} ${names.join(', ')}`).join(' · ');
    const line = (duty: Duty, entries: RosterEntry[]) => {
        const {tint, icon: Icon} = DUTY_STYLE[duty];
        return <p className="flex min-w-0 items-center gap-2 text-sm">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${tint}`}><Icon size={15}/></span>
            <span className="shrink-0 text-slate-400">{duty}</span>
            {loading ? <Skeleton className="h-4 w-20"/> : <span className="truncate font-medium">
                {entries.length ? duty === 'Off' ? byDay(entries) : entries.map(e => nameOf(e, staff)).join(', ') : <span className="font-normal text-slate-400">Nobody</span>}</span>}
        </p>;
    };
    return <section aria-busy={loading} aria-label={`This week’s duties, ${weekSpan(monday)}`}
                    className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-slate-200 bg-white px-5 py-3">
        {line('Cleaning', cleaning)}
        {line('Off', off)}
        <button onClick={onOpen} className="ml-auto text-sm font-semibold text-blue-600">View staff</button>
    </section>;
}
