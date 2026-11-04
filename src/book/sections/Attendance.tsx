import {useState} from 'react';
import {Check, ChevronLeft, ChevronRight, ClipboardList, X} from 'lucide-react';
import {addDays, isoDay, startOfDay} from '../format';
import {isAttendant, presentOn, SHARE_START} from '../payments';
import type {Attendance as Sheet, Role, Staff} from '../types';
import {Skeleton} from '../components/Skeleton';

const STEP = 'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40';

// Who came to work, one day at a time. The cashier marks it on the staff PIN as people arrive;
// each day's revenue share is split among the attendants on it, so a name not marked here is
// not paid for the day.
//
// Staff can mark today only — the day they can see for themselves. Earlier days stay open to
// the admin PIN for the morning somebody forgot, so a correction is a decision rather than a
// habit. Nobody marks the future.
export function Attendance({staff, attendance, role, loading, onSet}: {
    staff: Staff[];
    attendance: Sheet[];
    role: Role;
    loading: boolean;
    onSet: (day: string, person: Staff, present: boolean) => Promise<void>
}) {
    const today = startOfDay(new Date());
    const [date, setDate] = useState(today);
    const [saving, setSaving] = useState<string | null>(null);
    const day = isoDay(date), isToday = day === isoDay(today);
    const editable = isToday || (role === 'admin' && date >= SHARE_START && date < today);

    const attendants = staff.filter(isAttendant);
    const present = presentOn(day, staff, attendance).map(p => p.id);

    const toggle = async (person: Staff, on: boolean) => {
        setSaving(person.id);
        try {
            await onSet(day, person, on);
        } finally {
            setSaving(null);
        }
    };

    const label = date.toLocaleDateString('en-NG', {weekday: 'long', day: 'numeric', month: 'long'});
    return <>
        <p className="mb-7 text-sm text-slate-500">Mark every attendant who comes to work.</p>

        <section className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <ClipboardList/></div>
                    <div><h2 className="font-bold">{isToday ? 'Today' : label}</h2>
                        <p className="text-xs text-slate-400">{isToday ? label : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isToday && <button type="button" onClick={() => setDate(today)}
                                         className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600">Today</button>}
                    <button type="button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}
                            disabled={date <= SHARE_START} className={STEP}><ChevronLeft size={17}/></button>
                    <button type="button" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}
                            disabled={isToday} className={STEP}><ChevronRight size={17}/></button>
                </div>
            </div>
            {!editable && !loading && <p className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                {role === 'admin' ? 'Before revenue sharing started — nothing to mark.' : 'Only today can be marked. Ask an admin to correct an earlier day.'}</p>}
            {loading ? <ul aria-busy className="divide-y divide-slate-100">{[0, 1, 2].map(i => <li key={i} className="px-5 py-4">
                    <Skeleton className="h-4 w-40"/></li>)}</ul>
                : !attendants.length ? <p className="px-5 py-10 text-center text-sm text-slate-400">
                        No attendants set up yet. {role === 'admin' ? 'Set them up in the attendant pool on Payments.' : 'Ask an admin to set them up.'}</p>
                    : <ul className="divide-y divide-slate-100">{attendants.map(p => {
                        const on = present.includes(p.id);
                        return <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-4">
                            <div className="min-w-0"><p className="truncate font-medium">{p.name}</p></div>
                            <div role="group" aria-label={`${p.name} attendance`} className="flex shrink-0 gap-2">
                                <button type="button" aria-pressed={on} disabled={!editable || saving === p.id || on}
                                        onClick={() => toggle(p, true)}
                                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-default ${on ? 'bg-emerald-600 text-white' : 'border border-slate-200 text-slate-500'} ${!editable && !on ? 'opacity-50' : ''}`}>
                                    <Check size={14}/> Present
                                </button>
                                <button type="button" aria-pressed={!on} disabled={!editable || saving === p.id || !on}
                                        onClick={() => toggle(p, false)}
                                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-default ${!on ? 'bg-slate-100 text-slate-700' : 'border border-slate-200 text-slate-500'} ${!editable && on ? 'opacity-50' : ''}`}>
                                    <X size={14}/> Absent
                                </button>
                            </div>
                        </li>;
                    })}</ul>}
        </section>
    </>;
}
