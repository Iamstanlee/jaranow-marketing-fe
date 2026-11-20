import {useCallback, useEffect, useMemo, useState} from 'react';
import {CalendarClock, DollarSign, PiggyBank} from 'lucide-react';
import {PAYMENT_METHODS} from '../constants';
import {addDays, isoDay, money, percent, startOfMonth, startOfWeek} from '../format';
import {onTeamOn, type PayLine, SHARE_RATE, SHARE_START, weekPay, type WeekPay} from '../payments';
import {weekSpan} from '../roster';
import {monthPay, SALARY_DUE_DAY, salaryDue} from '../salary';
import type {Advance, Attendance, Payout, Role, RosterEntry, Sale, Staff} from '../types';
import {Confirm} from '../components/Confirm';
import {Stat} from '../components/Stat';
import {AttendantMonth, MONTHS, monthsFrom} from './Salary';

// How many weeks back an unpaid week still counts as owed, this one included.
const WEEKS = 8;

const dayMonth = (date: Date) => date.toLocaleDateString('en-NG', {day: 'numeric', month: 'short'});
const weekday = (date: Date) => date.toLocaleDateString('en-NG', {weekday: 'short'});
const daysText = (n: number) => `${n} day${n === 1 ? '' : 's'} worked`;

// Readable on both PINs; paying and advances are admin-only.
export function Payments({sales, staff, payouts, attendance, roster, role, loading, requestHistory, historyLoading, onAddAdvance, onRemoveAdvance, onPay, onUndo}: {
    sales: Sale[];
    staff: Staff[];
    payouts: Payout[];
    attendance: Attendance[];
    roster: RosterEntry[];
    role: Role;
    loading: boolean;
    requestHistory: (from: number) => void;
    historyLoading: boolean;
    onAddAdvance: (person: Staff, entry: Omit<Advance, 'id'>) => Promise<void>;
    onRemoveAdvance: (person: Staff, advance: Advance) => Promise<void>;
    onPay: (record: Omit<Payout, 'id' | 'createdAt' | 'rate' | 'expenseId'>) => Promise<void>;
    onUndo: (payout: Payout) => Promise<void>
}) {
    const thisMonday = startOfWeek(new Date()), thisMonth = startOfMonth(new Date());
    // Never before revenue sharing began.
    const count = Math.max(1, Math.min(WEEKS, Math.round((thisMonday.getTime() - SHARE_START.getTime()) / 604_800_000) + 1));
    const firstMonday = addDays(thisMonday, -7 * (count - 1));
    // History back to the earlier of the owed weeks and the months the pay view walks.
    const reach = Math.max(SHARE_START.getTime(), Math.min(firstMonday.getTime(),
        startOfWeek(monthsFrom(thisMonth, 1 - MONTHS)).getTime()));
    useEffect(() => requestHistory(reach), [reach, requestHistory]);

    const admin = role === 'admin';
    const weekOf = useCallback((monday: Date) => weekPay(monday, sales, staff, payouts, attendance), [sales, staff, payouts, attendance]);
    const weeks = useMemo(() => Array.from({length: count}, (_, i) => weekOf(addDays(thisMonday, -7 * i))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [weekOf, thisMonday.getTime(), count]);
    const [paying, setPaying] = useState<{ pay: WeekPay; line: PayLine } | null>(null);
    // Decides whether end-of-day deducts the payout from cash.
    const [method, setMethod] = useState('Cash');
    const [undoing, setUndoing] = useState<Payout | null>(null);

    const unpaid = (list: WeekPay[]) => list.flatMap(w => w.lines).filter(l => !l.payout).reduce((sum, l) => sum + l.amount, 0);
    const thisWeek = unpaid(weeks.slice(0, 1)), owed = unpaid(weeks.slice(1));
    const salaries = useMemo(() => staff.filter(p => onTeamOn(p, isoDay(thisMonth)) && p.attendantPay !== 'share')
            .reduce((sum, p) => sum + Math.max(0, monthPay(p, thisMonth, staff, attendance, roster, payouts).balance), 0),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [staff, attendance, roster, payouts, thisMonth.getTime()]);

    return <>
        <p className="mb-7 text-sm text-slate-500">
            Revenue share is paid every Sunday: {percent(SHARE_RATE)} of each day's washes, split between the carwash attendants
            present. Salaries are paid on the {SALARY_DUE_DAY}th.
        </p>

        {admin && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat title="This week so far" note='Revenue share earned this week' icon={CalendarClock} tint="bg-sky-50 text-sky-600" loading={loading}
                  value={money(thisWeek)}/>
            <Stat title="Owed from past weeks" icon={DollarSign} loading={loading || historyLoading}
                  tint={owed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}
                  value={money(owed)} note={owed ? 'Not yet marked paid' : 'Everyone is paid up'}/>
            <Stat title="Total pending" icon={PiggyBank} tint="bg-slate-100 text-slate-600" loading={loading || historyLoading}
                  value={money(salaries + thisWeek + owed)}
                  note={`${money(salaries)} salary, due ${dayMonth(salaryDue(thisMonth))} · ${money(thisWeek + owed)} revenue share`}/>
        </div>}

        <AttendantMonth staff={staff} attendance={attendance} roster={roster} payouts={payouts} loading={loading}
                        weeksLoading={historyLoading} weekOf={weekOf}
                        onAddAdvance={admin ? onAddAdvance : undefined}
                        onRemoveAdvance={admin ? onRemoveAdvance : undefined}
                        onPayWeek={admin ? (pay, line) => {
                            setMethod('Cash');
                            setPaying({pay, line});
                        } : undefined}
                        onUndoWeek={admin ? setUndoing : undefined}/>

        {paying && <Confirm title={`Pay ${paying.line.name}?`} action={`Mark ${money(paying.line.amount)} paid`}
                            detail={`${money(paying.line.amount)} for ${daysText(paying.line.days)} in the week of ${weekSpan(paying.pay.monday)}. Recorded as a Staff expense today.${paying.pay.unmarked.length ? ` No attendance was marked for ${paying.pay.unmarked.map(weekday).join(', ')}, so nothing is paid for ${paying.pay.unmarked.length === 1 ? 'that day' : 'those days'}.` : ''}`}
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
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select></label>
        </Confirm>}
        {undoing && <Confirm title="Undo this payment?" tone="danger" action="Undo payment" busyLabel="Undoing…"
                             detail={`${undoing.staffName}'s ${money(undoing.amount)} goes back to owed and its Staff expense is deleted. Only undo if the money was not handed over.`}
                             close={() => setUndoing(null)} confirm={() => onUndo(undoing)}/>}
    </>;
}
