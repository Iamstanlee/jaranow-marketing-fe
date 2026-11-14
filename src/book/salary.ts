import {addDays, dayFrom, isoDay, startOfDay, startOfMonth, startOfWeek} from './format';
import {ATTENDANCE_START, markOn, payday} from './payments';
import {weekRoster} from './roster';
import type {Advance, Attendance, Payout, RosterEntry, Staff} from './types';

// Monthly salary: the base less one day's rate (base ÷ days in month) per day absent or past
// and unmarked. Not deducted: a rota Sunday off, paid leave, today onward, anything before
// ATTENDANCE_START. A cashier has no attendance, so their salary is fixed. Advances and share
// payouts (by their week's payday) come off the balance in the month they fall in.
export const SALARY_DUE_DAY = 28;
export const salaryDue = (month: Date) => new Date(month.getFullYear(), month.getMonth(), SALARY_DUE_DAY);

export type DayStatus = 'worked' | 'off' | 'paidOff' | 'absent' | 'unmarked' | 'upcoming' | 'before';
export type MonthDay = { day: string; date: Date; status: DayStatus };
export type MonthPay = {
    month: string;
    days: MonthDay[];
    worked: number;
    off: number;
    paidOff: number;
    absent: number;
    unmarked: number;
    missed: number;
    // 0 until a base salary is set.
    base: number;
    rate: number;
    deduction: number;
    earned: number;
    advances: Advance[];
    advance: number;
    sharePaid: number;
    balance: number;
};

export const monthKey = (date: Date) => isoDay(startOfMonth(date)).slice(0, 7);

export function monthPay(person: Staff, month: Date, staff: Staff[], attendance: Attendance[], roster: RosterEntry[], payouts: Payout[], today = new Date()): MonthPay {
    const first = startOfMonth(month), key = monthKey(first), now = startOfDay(today).getTime();
    const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const days: MonthDay[] = !person.attendantPay ? [] : Array.from({length}, (_, i) => {
        const date = addDays(first, i), day = isoDay(date), at = date.getTime();
        const mark = markOn(day, person.id, attendance);
        const status: DayStatus = at < ATTENDANCE_START.getTime() ? 'before'
            : mark === 'present' ? 'worked'
                : mark === 'leave' ? 'paidOff'
                : mark === 'absent' ? 'absent'
                : at >= now ? 'upcoming'
                    : date.getDay() === 0 && weekRoster(roster, staff, startOfWeek(date)).off.some(e => e.staffId === person.id) ? 'off'
                        : 'unmarked';
        return {day, date, status};
    });
    const count = (status: DayStatus) => days.filter(d => d.status === status).length;
    const absent = count('absent'), unmarked = count('unmarked'), missed = absent + unmarked;
    const base = person.salary || 0, rate = base / length;
    const deduction = Math.round(rate * missed);
    const next = new Date(first.getFullYear(), first.getMonth() + 1, 1).getTime();
    const advances = (Array.isArray(person.advances) ? person.advances : [])
        .filter(a => a.at >= first.getTime() && a.at < next).sort((a, b) => a.at - b.at);
    const earned = base - deduction, advance = advances.reduce((sum, a) => sum + a.amount, 0);
    const sharePaid = payouts.filter(p => {
        const sunday = payday(dayFrom(p.week)).getTime();
        return p.staffId === person.id && sunday >= first.getTime() && sunday < next;
    }).reduce((sum, p) => sum + p.amount, 0);
    return {
        month: key, days, worked: count('worked'), off: count('off'), paidOff: count('paidOff'), absent, unmarked, missed,
        base, rate, deduction, earned, advances, advance, sharePaid,
        balance: base ? earned - advance - sharePaid : 0
    };
}
