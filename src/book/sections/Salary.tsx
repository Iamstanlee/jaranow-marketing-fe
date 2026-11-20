import React, {useMemo, useState} from 'react';
import {CalendarDays, ChevronLeft, ChevronRight, Plus, X} from 'lucide-react';
import {addDays, dayFrom, isoDay, money, startOfDay, startOfMonth, startOfWeek} from '../format';
import {ATTENDANCE_START, onTeamOn, payday, type PayLine, SHARE_START, type WeekPay} from '../payments';
import {type DayStatus, monthPay, salaryDue} from '../salary';
import type {Advance, Attendance, Payout, RosterEntry, Staff} from '../types';
import {Confirm} from '../components/Confirm';
import {Modal} from '../components/Modal';
import {Skeleton} from '../components/Skeleton';

// Must stay inside LIVE_WINDOW.attendance: attendance has no history fetch.
export const MONTHS = 3;

export const monthsFrom = (date: Date, n: number) => new Date(date.getFullYear(), date.getMonth() + n, 1);
const monthName = (date: Date) => date.toLocaleDateString('en-NG', {month: 'long', year: 'numeric'});
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const shortDay = (date: Date) => date.toLocaleDateString('en-NG', {day: 'numeric', month: 'short'});
const whenText = (at: number) => {
    const d = new Date(at);
    return `${d.toLocaleDateString('en-NG', {weekday: 'short', day: 'numeric', month: 'short'})} · ${d.toLocaleTimeString('en-NG', {hour: 'numeric', minute: '2-digit', hour12: true})}`;
};

const LOOK: Record<DayStatus, { cell: string; label: string; mark?: string }> = {
    worked: {cell: 'bg-blue-600 font-semibold text-white', label: 'Worked'},
    off: {cell: 'bg-slate-100 text-slate-500', label: 'Day off', mark: 'off'},
    paidOff: {cell: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200', label: 'Paid leave', mark: 'paid'},
    absent: {cell: 'bg-red-50 font-semibold text-red-700 ring-1 ring-inset ring-red-200', label: 'Absent'},
    unmarked: {cell: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200', label: 'Not marked', mark: '?'},
    upcoming: {cell: 'text-slate-400', label: 'Still to come'},
    before: {cell: 'text-slate-300', label: 'Before attendance was kept'},
    unjoined: {cell: 'text-slate-300', label: 'Before they joined'},
    left: {cell: 'text-slate-300', label: 'After their last day'}
};
const LEGEND: DayStatus[] = ['worked', 'off', 'paidOff', 'absent', 'unmarked'];

type ShareWeek = {
    pay: WeekPay;
    line?: PayLine;
    sunday: Date;
    status: 'paid' | 'owed' | 'running' | 'none'
};

// Read-only when the admin handlers are absent (staff PIN).
export function AttendantMonth({staff, attendance, roster, payouts, loading, weeksLoading, weekOf, onAddAdvance, onRemoveAdvance, onPayWeek, onUndoWeek}: {
    staff: Staff[];
    attendance: Attendance[];
    roster: RosterEntry[];
    payouts: Payout[];
    loading: boolean;
    weeksLoading: boolean;
    weekOf: (monday: Date) => WeekPay;
    onAddAdvance?: (person: Staff, entry: Omit<Advance, 'id'>) => Promise<void>;
    onRemoveAdvance?: (person: Staff, advance: Advance) => Promise<void>;
    onPayWeek?: (pay: WeekPay, line: PayLine) => void;
    onUndoWeek?: (payout: Payout) => void
}) {
    const thisMonth = startOfMonth(new Date());
    const earliest = Math.max(startOfMonth(ATTENDANCE_START).getTime(), monthsFrom(thisMonth, 1 - MONTHS).getTime());
    const [month, setMonth] = useState(thisMonth);
    const attendants = useMemo(() => staff.filter(p => onTeamOn(p, isoDay(month))), [staff, month]);
    const [chosen, setChosen] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState<Advance | null>(null);
    const person = attendants.find(p => p.id === chosen) || attendants[0];
    const pay = useMemo(() => person && monthPay(person, month, staff, attendance, roster, payouts),
        [person, month, staff, attendance, roster, payouts]);
    const current = month.getTime() === thisMonth.getTime();
    const salaried = person?.attendantPay !== 'share', cashier = !person?.attendantPay;
    const leftOn = person && !person.active && person.leftAt ? dayFrom(person.leftAt) : null;

    // A week belongs to the month of its payday. Someone now on salary keeps only paid weeks.
    const weeks = useMemo(() => {
        if (!person) return [];
        const next = monthsFrom(month, 1).getTime(), today = startOfDay(new Date()).getTime();
        const list: ShareWeek[] = [];
        for (let monday = startOfWeek(month); monday.getTime() < next; monday = addDays(monday, 7)) {
            const sunday = payday(monday);
            if (sunday.getTime() < month.getTime() || sunday.getTime() >= next || monday.getTime() < SHARE_START.getTime() || monday.getTime() > today) continue;
            const week = weekOf(monday), line = week.lines.find(l => l.staffId === person.id);
            list.push({
                pay: week, line, sunday,
                status: line?.payout ? 'paid' : sunday.getTime() > today ? 'running' : line?.amount ? 'owed' : 'none'
            });
        }
        return salaried ? list.filter(w => w.status === 'paid') : list;
    }, [person, salaried, month, weekOf]);
    const sum = (status?: string) => weeks.filter(w => !status || w.status === status).reduce((total, w) => total + (w.line?.amount || 0), 0);
    const weekRows = <WeekRows weeks={weeks} onPay={onPayWeek} onUndo={onUndoWeek}/>;

    return <section className="mt-7 rounded-2xl border border-slate-200 bg-white" aria-busy={loading}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><CalendarDays/></div>
                <h2 className="font-bold">Staff pay</h2>
            </div>
            <div className="flex items-center gap-1">
                <button type="button" aria-label="Previous month" disabled={month.getTime() <= earliest}
                        onClick={() => setMonth(m => monthsFrom(m, -1))}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <ChevronLeft size={18}/></button>
                <p className="w-36 text-center text-sm font-semibold" aria-live="polite">{monthName(month)}</p>
                <button type="button" aria-label="Next month" disabled={current}
                        onClick={() => setMonth(m => monthsFrom(m, 1))}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                    <ChevronRight size={18}/></button>
            </div>
        </div>

        {loading ? <div className="space-y-3 p-5"><Skeleton className="h-8 w-64"/><Skeleton className="h-48 w-full"/></div>
            : !person || !pay ? <p className="px-5 py-10 text-center text-sm text-slate-400">Nobody on the team yet. Add
                    people in Staff.</p>
                : <div className="p-5">
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Team member">{attendants.map(p =>
                        <button key={p.id} type="button" aria-pressed={p.id === person.id} onClick={() => setChosen(p.id)}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ${p.id === person.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {p.name}{p.active ? '' : ' · left'}</button>)}</div>

                    <div className={`mt-5 grid gap-6 ${cashier ? 'max-w-md' : 'lg:grid-cols-[minmax(0,1fr)_22rem]'}`}>
                        {!cashier && <div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} className="py-1">{d}</span>)}
                            </div>
                            <ul className="mt-1 grid grid-cols-7 gap-1">
                                {/* Monday-first: pad to the weekday the 1st falls on. */}
                                {Array.from({length: (pay.days[0].date.getDay() + 6) % 7}, (_, i) => <li key={`pad-${i}`} aria-hidden/>)}
                                {pay.days.map(d => {
                                    const look = LOOK[d.status];
                                    return <li key={d.day} aria-label={`${d.date.getDate()} ${monthName(month)} — ${look.label}`}
                                               className={`relative grid h-11 place-items-center rounded-lg text-sm tabular-nums ${look.cell}`}>
                                        {d.date.getDate()}
                                        {look.mark && <span aria-hidden className="absolute right-1 top-0.5 text-[9px] font-semibold leading-none">{look.mark}</span>}
                                    </li>;
                                })}
                            </ul>
                            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">{LEGEND.map(s =>
                                <li key={s} className="flex items-center gap-1.5">
                                    <span aria-hidden className={`h-3 w-3 rounded ${LOOK[s].cell}`}/>{LOOK[s].label}</li>)}</ul>
                        </div>}

                        <div className="rounded-xl bg-slate-50 p-4 text-sm">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{person.name} · {cashier ? 'Cashier · salary' : salaried ? 'Salary' : 'Revenue share'}{leftOn ? ` · Left ${shortDay(leftOn)}` : ''}</p>
                            {!cashier && <>
                                <p className="mt-2 text-2xl font-bold tracking-tight">{plural(pay.worked, 'day')} worked</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {[plural(pay.absent, 'absence'), pay.off && plural(pay.off, 'day') + ' off', pay.paidOff && plural(pay.paidOff, 'day') + ' paid leave',
                                        pay.unmarked && plural(pay.unmarked, 'day') + ' not marked'].filter(Boolean).join(' · ')}</p>
                            </>}

                            {!salaried ? <div className="mt-4 border-t border-slate-200 pt-4">
                                    <p className="text-xs font-semibold text-slate-500">Weeks paid in {monthName(month)}</p>
                                    {weeksLoading ? <Skeleton className="mt-3 h-16 w-full"/>
                                        : !weeks.length ? <p className="mt-3 text-xs text-slate-400">None yet.</p>
                                            : <>
                                                {weekRows}
                                                <dl className="mt-4 space-y-2 border-t border-slate-200 pt-4 tabular-nums">
                                                    <Row label="Earned" value={money(sum())} strong/>
                                                    <Row label="Paid" value={money(sum('paid'))}/>
                                                    <Row label="Owed" value={money(sum('owed'))}/>
                                                </dl>
                                            </>}
                                </div>
                                : !pay.base ? <p className={`text-xs text-slate-500 ${cashier ? 'mt-3' : 'mt-4 border-t border-slate-200 pt-4'}`}>
                                        No base salary set. {onAddAdvance ? `Edit ${person.name} in Staff to add it.` : 'Ask an admin to add it in Staff.'}</p>
                                    : <>
                                        <dl className={`space-y-2 tabular-nums ${cashier ? 'mt-3' : 'mt-4 border-t border-slate-200 pt-4'}`}>
                                            <Row label="Base salary" value={money(pay.base)}/>
                                            {pay.unjoined > 0 && <Row label={`Before they joined · ${plural(pay.unjoined, 'day')}`}
                                                                      value={`− ${money(pay.prorated)}`}/>}
                                            {pay.left > 0 && <Row label={`After their last day · ${plural(pay.left, 'day')}`}
                                                                  value={`− ${money(pay.afterLeft)}`}/>}
                                            {pay.missed > 0 && <Row label={`${pay.unmarked ? 'Absent or not marked' : 'Absences'} · ${plural(pay.missed, 'day')}`}
                                                                     value={`− ${money(pay.deduction)}`}/>}
                                            {!cashier && <Row label={pay.left > 0 ? 'Salary to their last day' : current ? 'Salary so far' : 'Salary for the month'} value={money(pay.earned)} strong/>}
                                            {pay.advance > 0 && <Row label="Advances" value={`− ${money(pay.advance)}`}/>}
                                            {pay.sharePaid > 0 && <Row label="Revenue share paid" value={`− ${money(pay.sharePaid)}`}/>}
                                            <Row label={`Balance · due ${shortDay(salaryDue(month))}`} value={money(pay.balance)} strong/>
                                        </dl>
                                        <div className="mt-4 border-t border-slate-200 pt-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xs font-semibold text-slate-500">Advances</p>
                                                {onAddAdvance && <button type="button" onClick={() => setAdding(true)}
                                                                         className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white">
                                                    <Plus size={13}/>Record advance</button>}
                                            </div>
                                            {!pay.advances.length ? <p className="mt-3 text-xs text-slate-400">None this month.</p>
                                                : <ol className="mt-3 space-y-3 border-l-2 border-slate-200 pl-4">{pay.advances.map(a =>
                                                    <li key={a.id} className="relative flex items-start justify-between gap-3">
                                                        <span aria-hidden className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-4 ring-slate-50"/>
                                                        <div><p className="font-semibold tabular-nums text-slate-800">{money(a.amount)}</p>
                                                            <p className="text-xs text-slate-500">Requested {whenText(a.at)}</p></div>
                                                        {onRemoveAdvance && <button type="button" aria-label={`Remove the ${money(a.amount)} advance`}
                                                                                    onClick={() => setRemoving(a)}
                                                                                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-red-600">
                                                            <X size={14}/></button>}
                                                    </li>)}</ol>}
                                        </div>
                                    </>}
                            {salaried && !weeksLoading && weeks.length > 0 && <div className="mt-4 border-t border-slate-200 pt-4">
                                <p className="text-xs font-semibold text-slate-500">Revenue share paid before moving to salary</p>
                                {weekRows}
                            </div>}
                        </div>
                    </div>
                </div>}

        {adding && person && onAddAdvance && <AdvanceModal person={person} close={() => setAdding(false)}
                                                           save={entry => onAddAdvance(person, entry)}/>}
        {removing && person && onRemoveAdvance && <Confirm title="Remove this advance?" tone="danger" action="Remove advance"
                                                           busyLabel="Removing…"
                                                           detail={`${person.name}'s ${money(removing.amount)} advance, requested ${whenText(removing.at)}, goes back onto the balance to pay.`}
                                                           close={() => setRemoving(null)}
                                                           confirm={() => onRemoveAdvance(person, removing)}/>}
    </section>;
}

const Row = ({label, value, strong}: { label: string; value: string; strong?: boolean }) =>
    <div className={`flex items-baseline justify-between gap-3 ${strong ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
        <dt>{label}</dt>
        <dd>{value}</dd>
    </div>;

const TAG = 'w-[4.5rem] rounded-lg py-1.5 text-center text-xs font-semibold';

// For admin the status is the action: Mark paid, or Paid to undo.
function WeekRows({weeks, onPay, onUndo}: {
    weeks: ShareWeek[];
    onPay?: (pay: WeekPay, line: PayLine) => void;
    onUndo?: (payout: Payout) => void
}) {
    return <ul className="mt-3 space-y-2.5">{weeks.map(({pay, line, sunday, status}) => <li key={pay.week} className="flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="font-medium text-slate-700">{shortDay(pay.monday)} – {shortDay(sunday)}</p>
            <p className="text-xs text-slate-400">{plural(line?.days || 0, 'day')} worked</p>
            {line?.payout && line.drift !== 0 && <p className="text-xs text-amber-600">
                Changed since paid — {money(Math.abs(line.drift))} {line.drift > 0 ? 'more owed' : 'overpaid'}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
            <b className="tabular-nums">{money(line?.amount || 0)}</b>
            {status === 'paid' ? onUndo ? <button type="button" onClick={() => onUndo(line!.payout!)}
                                                  aria-label="Paid — undo this payment"
                                                  className={`${TAG} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>Paid</button>
                    : <span className={`${TAG} bg-emerald-50 text-emerald-700`}>Paid</span>
                : status === 'owed' ? onPay ? <button type="button" onClick={() => onPay(pay, line!)}
                                                      className={`${TAG} bg-blue-600 text-white`}>Mark paid</button>
                        : <span className={`${TAG} bg-red-50 text-red-700`}>Owed</span>
                    : <span className={`${TAG} bg-slate-200 text-slate-600`}>{status === 'running' ? 'Running' : '—'}</span>}
        </div>
    </li>)}</ul>;
}

// datetime-local wants local time; toISOString would give UTC.
const localInput = (date: Date) => {
    const two = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
};

function AdvanceModal({person, close, save}: {
    person: Staff;
    close: () => void;
    save: (entry: Omit<Advance, 'id'>) => Promise<void>
}) {
    const [amount, setAmount] = useState(''), [when, setWhen] = useState(() => localInput(new Date()));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const at = new Date(when).getTime();
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({amount: Number(amount), at});
            close();
        } catch (err) {
            console.error('Failed to record advance', err);
            setError('Could not save this advance. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    const field = 'mt-1 w-full rounded-xl border-slate-200';
    return <Modal title={`Advance for ${person.name}`} close={close}>
        <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">Amount (₦)
                <input required autoFocus inputMode="numeric" value={amount}
                       onChange={e => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 10000" className={field}/>
            </label>
            <label className="block text-sm font-medium">Requested on
                <input required type="datetime-local" value={when} max={localInput(new Date())}
                       onChange={e => setWhen(e.target.value)} className={field}/>
                {!Number.isNaN(at) && <span className="mt-1 block text-xs font-normal text-slate-400">
                    Comes off the {monthName(new Date(at))} salary.</span>}
            </label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting || !Number(amount) || Number.isNaN(at)}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : 'Record advance'}</button>
        </form>
    </Modal>;
}
