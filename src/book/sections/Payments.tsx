import {useEffect, useMemo, useState} from 'react';
import {CalendarClock, DollarSign, TriangleAlert, Users} from 'lucide-react';
import {addDays, isToday, money, percent, startOfDay, startOfWeek} from '../format';
import {payday, type PayLine, SHARE_RATE, SHARE_START, weekPay, type WeekPay} from '../payments';
import {weekSpan} from '../roster';
import type {AttendantPay, Attendance, Payout, Role, Sale, Staff} from '../types';
import {Confirm} from '../components/Confirm';
import {Skeleton} from '../components/Skeleton';
import {Stat} from '../components/Stat';

// How many weeks the section lists, this one included. Two months is enough to catch a week
// that slipped by unpaid without turning the page into a ledger.
const WEEKS = 8;

const PAY_OPTIONS: Array<{ value: '' | AttendantPay; label: string }> = [
    {value: '', label: 'Not an attendant'},
    {value: 'salary', label: 'Attendant · salary'},
    {value: 'share', label: 'Attendant · revenue share'}
];

const dayMonth = (date: Date) => date.toLocaleDateString('en-NG', {weekday: 'short', day: 'numeric', month: 'short'});
const weekday = (date: Date) => date.toLocaleDateString('en-NG', {weekday: 'short'});
const daysText = (n: number) => `${n} day${n === 1 ? '' : 's'} worked`;

// Where a week stands. A week cannot be paid before its Sunday — it is still trading, and a
// payout written on Thursday would miss the rest of the week's washes.
const statusOf = (pay: WeekPay) => {
    const sunday = payday(pay.monday), now = startOfDay(new Date()).getTime();
    const owed = pay.lines.filter(l => !l.payout && l.amount > 0);
    if (now < sunday.getTime()) return {label: `Running · due ${dayMonth(sunday)}`, tone: 'bg-slate-100 text-slate-600', payable: false};
    if (!owed.length) return {label: pay.lines.some(l => l.payout) ? 'Paid' : 'Nothing owed', tone: 'bg-emerald-50 text-emerald-700', payable: true};
    if (isToday(sunday)) return {label: 'Due today', tone: 'bg-blue-50 text-blue-700', payable: true};
    return {label: 'Overdue', tone: 'bg-red-50 text-red-700', payable: true};
};

// Both roles can read it — the cashier is the one telling attendants what they are owed —
// but only the admin PIN sets who is in the pool and marks money as handed over.
export function Payments({sales, staff, payouts, attendance, role, loading, requestHistory, historyLoading, onSetPay, onPay, onUndo}: {
    sales: Sale[];
    staff: Staff[];
    payouts: Payout[];
    attendance: Attendance[];
    role: Role;
    loading: boolean;
    requestHistory: (from: number) => void;
    historyLoading: boolean;
    onSetPay: (person: Staff, pay: AttendantPay | null) => Promise<void>;
    onPay: (record: Omit<Payout, 'id' | 'createdAt' | 'rate' | 'expenseId'>) => Promise<void>;
    onUndo: (payout: Payout) => Promise<void>
}) {
    const thisMonday = startOfWeek(new Date());
    // Back WEEKS weeks, but never before revenue sharing began.
    const count = Math.max(1, Math.min(WEEKS, Math.round((thisMonday.getTime() - SHARE_START.getTime()) / 604_800_000) + 1));
    const firstMonday = addDays(thisMonday, -7 * (count - 1));
    // The weeks listed reach well past the live sales window, so ask for the history behind it.
    useEffect(() => requestHistory(firstMonday.getTime()), [firstMonday.getTime(), requestHistory]); // eslint-disable-line react-hooks/exhaustive-deps

    const admin = role === 'admin';
    const weeks = useMemo(() => Array.from({length: count}, (_, i) => weekPay(addDays(thisMonday, -7 * i), sales, staff, payouts, attendance)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [sales, staff, payouts, attendance, thisMonday.getTime(), count]);
    const [paying, setPaying] = useState<{ pay: WeekPay; line: PayLine } | null>(null);
    // How the money was handed over. It is what decides whether end-of-day takes it out of
    // the cash to transfer, so it is asked every time rather than assumed.
    const [method, setMethod] = useState('Cash');
    const [undoing, setUndoing] = useState<Payout | null>(null);
    const [saving, setSaving] = useState<string | null>(null);

    const active = staff.filter(p => p.active);
    const current = weeks[0];
    const owed = weeks.slice(1).flatMap(w => w.lines).filter(l => !l.payout).reduce((sum, l) => sum + l.amount, 0);

    const setPay = async (person: Staff, value: string) => {
        setSaving(person.id);
        try {
            await onSetPay(person, (value || null) as AttendantPay | null);
        } finally {
            setSaving(null);
        }
    };

    return <>
        <p className="mb-7 text-sm text-slate-500">
            Attendants on revenue share are paid every Sunday. Each day, {percent(SHARE_RATE)} of every wash is split by
            the number of attendants present.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
            <Stat title="This week so far" icon={CalendarClock} tint="bg-sky-50 text-sky-600" loading={loading}
                  value={money(current.lines.filter(l => l.pay === 'share').reduce((sum, l) => sum + l.amount, 0))}
                  note={`Due ${dayMonth(payday(thisMonday))} · from ${money(current.revenue)} sales`}/>
            <Stat title="Owed from past weeks" icon={DollarSign} loading={loading || historyLoading}
                  tint={owed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}
                  value={money(owed)} note={owed ? 'Not yet marked paid' : 'Everyone is paid up'}/>
        </div>

        {admin && <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Users/></div>
                <div><h2 className="font-bold">Attendant pool</h2><p className="text-xs text-slate-400">
                    Changing this re-works every unpaid week, past ones included — pay out a finished week first.</p>
                </div>
            </div>
            {loading ? <ul aria-busy className="divide-y divide-slate-100">{[0, 1, 2].map(i => <li key={i} className="px-5 py-4">
                    <Skeleton className="h-4 w-40"/></li>)}</ul>
                : !active.length ? <p className="px-5 py-10 text-center text-sm text-slate-400">Nobody on the team yet. Add
                        people in the Staff section.</p>
                    : <ul className="divide-y divide-slate-100">{active.map(p => <li key={p.id}
                                                                                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium">{p.name}</p>
                        <label className="sr-only" htmlFor={`pay-${p.id}`}>How {p.name} is paid</label>
                        <select id={`pay-${p.id}`} value={p.attendantPay ?? ''} disabled={saving === p.id}
                                onChange={e => setPay(p, e.target.value)}
                                className="rounded-xl border-slate-200 text-sm sm:w-64">
                            {PAY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </li>)}</ul>}
        </section>}

        <div className="mt-7 space-y-5">{weeks.map((pay, i) => {
            const status = statusOf(pay);
            // Older weeks wait on the history fetch; this week and last are in the live window.
            const pending = loading || (i > 1 && historyLoading);
            return <section key={pay.week} aria-busy={pending} className="rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
                    <div><h2 className="font-bold">{i === 0 ? 'This week' : `Week of ${weekSpan(pay.monday)}`}</h2>
                        {pending ? <Skeleton className="mt-2 h-3 w-48"/> : <p className="mt-1 text-xs text-slate-400">
                            {i === 0 && `${weekSpan(pay.monday)}`}</p>}
                    </div>
                    {!pending && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>{status.label}</span>}
                </div>
                {/* A day nobody was marked on pays nobody — said here, where the money is,
                    rather than left to look like a slow day. */}
                {!pending && pay.unmarked.length > 0 && <p className="flex items-start gap-2 border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-800">
                    <TriangleAlert size={14} className="mt-0.5 shrink-0"/>No attendance marked
                    for {pay.unmarked.map(weekday).join(', ')} — nobody is paid for {pay.unmarked.length === 1 ? 'that day' : 'those days'}.</p>}
                {pending ? <div className="px-5 py-4"><Skeleton className="h-4 w-56"/></div>
                    : !pay.lines.length ? <p className="px-5 py-6 text-sm text-slate-400">No attendants set up.</p>
                        : <ul className="divide-y divide-slate-100">{pay.lines.map(line => <li key={line.staffId}
                                                                                              className="flex items-center justify-between gap-3 px-5 py-4">
                            <div className="min-w-0">
                                <p className="truncate font-medium">{line.name}</p>
                                <p className="text-xs text-slate-400">{line.pay === 'share' ? 'Revenue share' : 'Salary'} · {daysText(line.days)}</p>
                                {/* A late or corrected sale after payment. Said, not settled: the
                                    difference is carried by hand, and the payout stays as paid. */}
                                {line.payout && line.drift !== 0 && <p className="mt-0.5 text-xs text-amber-600">
                                    Changed since paid — {money(Math.abs(line.drift))} {line.drift > 0 ? 'more owed' : 'overpaid'}</p>}
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                {/* Salary is paid outside the book; its line is there for the days. */}
                                {line.pay === 'share' && <b className="tabular-nums">{money(line.amount)}</b>}
                                {line.payout
                                    ? admin ? <button type="button" onClick={() => setUndoing(line.payout!)}
                                                      className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Paid</button>
                                        : <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Paid</span>
                                    : admin && status.payable && line.pay === 'share' && line.amount > 0
                                        ? <button type="button" onClick={() => {
                                                      setMethod('Cash');
                                                      setPaying({pay, line});
                                                  }}
                                                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Mark paid</button>
                                        : null}
                            </div>
                        </li>)}</ul>}
            </section>;
        })}</div>

        {paying && <Confirm title={`Pay ${paying.line.name}?`} action={`Mark ${money(paying.line.amount)} paid`}
                            detail={`${money(paying.line.amount)} for ${daysText(paying.line.days)} in the week of ${weekSpan(paying.pay.monday)}. It is recorded as a Staff expense today, and will not change if the team does.${paying.pay.unmarked.length ? ` No attendance was marked for ${paying.pay.unmarked.map(weekday).join(', ')}, so nothing is paid for ${paying.pay.unmarked.length === 1 ? 'that day' : 'those days'}.` : ''}`}
                            close={() => setPaying(null)}
                            confirm={() => onPay({
                                week: paying.pay.week,
                                staffId: paying.line.staffId,
                                staffName: paying.line.name,
                                amount: paying.line.amount,
                                revenue: paying.pay.revenue,
                                washes: paying.pay.washes,
                                days: paying.line.days,
                                payment: method
                            })}>
            <label className="mt-4 block text-sm font-medium">Paid by<select value={method}
                                                                          onChange={e => setMethod(e.target.value)}
                                                                          className="mt-1 w-full rounded-xl border-slate-200">
                <option>Cash</option>
                <option>Transfer</option>
                <option>POS</option>
            </select></label>
        </Confirm>}
        {undoing && <Confirm title="Undo this payment?" tone="danger" action="Undo payment" busyLabel="Undoing…"
                             detail={`${undoing.staffName}'s ${money(undoing.amount)} goes back to owed, worked out again from the week's attendance, and its Staff expense is deleted. Only do this if the money was not handed over.`}
                             close={() => setUndoing(null)} confirm={() => onUndo(undoing)}/>}
    </>;
}
