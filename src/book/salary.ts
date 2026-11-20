import {addDays, dayFrom, isoDay, startOfDay, startOfMonth, startOfWeek} from './format';
import {ATTENDANCE_START, markOn, payday} from './payments';
import {joinedAt, weekRoster} from './roster';
import type {Advance, Attendance, Payout, RosterEntry, Staff} from './types';

// Monthly salary: the base less one day's rate (base ÷ days in month) per day absent or past
// and unmarked. Unmarked days before they joined are unpaid too, but shown as `unjoined`, not
// missed. Not deducted: a rota day off, paid leave, today onward, anything before
// ATTENDANCE_START. Days after an archived person's last day are unpaid, shown as `left`. A cashier has no attendance, so their salary is fixed from the day they joined. Advances and share
// payouts (by their week's payday) come off the balance in the month they fall in.
export const SALARY_DUE_DAY = 28;
export const salaryDue = (month: Date) => new Date(month.getFullYear(), month.getMonth(), SALARY_DUE_DAY);

export type DayStatus = 'worked' | 'off' | 'paidOff' | 'absent' | 'unmarked' | 'upcoming' | 'before' | 'unjoined' | 'left';
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
    unjoined: number;
    left: number;
    // 0 until a base salary is set.
    base: number;
    rate: number;
    deduction: number;
    // What the days before they were added would have paid.
    prorated: number;
    // ...and the days after their last day.
    afterLeft: number;
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
    const weeks = new Map<string, string[]>();
    const offOn = (date: Date, day: string) => {
        const monday = startOfWeek(date), key = isoDay(monday);
        if (!weeks.has(key)) weeks.set(key, weekRoster(roster, staff, monday).off.filter(e => e.staffId === person.id).map(e => e.day));
        return weeks.get(key)!.includes(day);
    };
    const joined = joinedAt(person), last = !person.active && person.leftAt ? dayFrom(person.leftAt).getTime() : Infinity;
    const days: MonthDay[] = !person.attendantPay ? [] : Array.from({length}, (_, i) => {
        const date = addDays(first, i), day = isoDay(date), at = date.getTime();
        const mark = markOn(day, person.id, attendance);
        const status: DayStatus = at < ATTENDANCE_START.getTime() ? 'before'
            : at > last ? 'left'
            : mark === 'present' ? 'worked'
                : mark === 'leave' ? 'paidOff'
                : mark === 'absent' ? 'absent'
                : at < joined ? 'unjoined'
                : at >= now ? 'upcoming'
                    : offOn(date, day) ? 'off'
                        : 'unmarked';
        return {day, date, status};
    });
    const count = (status: DayStatus) => days.filter(d => d.status === status).length;
    const absent = count('absent'), unmarked = count('unmarked'), missed = absent + unmarked;
    const base = person.salary || 0, rate = base / length;
    const daysBetween = (from: number, to: number) => Math.min(length, Math.max(0, Math.round((to - from) / 86_400_000)));
    const deduction = Math.round(rate * missed), unjoined = person.attendantPay ? count('unjoined') : daysBetween(first.getTime(), joined);
    const next = new Date(first.getFullYear(), first.getMonth() + 1, 1).getTime();
    const left = person.attendantPay ? count('left') : last === Infinity ? 0 : daysBetween(last + 86_400_000, next);
    const prorated = Math.round(rate * unjoined), afterLeft = Math.round(rate * left);
    const advances = (Array.isArray(person.advances) ? person.advances : [])
        .filter(a => a.at >= first.getTime() && a.at < next).sort((a, b) => a.at - b.at);
    const earned = base - prorated - afterLeft - deduction, advance = advances.reduce((sum, a) => sum + a.amount, 0);
    const sharePaid = payouts.filter(p => {
        const sunday = payday(dayFrom(p.week)).getTime();
        return p.staffId === person.id && sunday >= first.getTime() && sunday < next;
    }).reduce((sum, p) => sum + p.amount, 0);
    return {
        month: key, days, worked: count('worked'), off: count('off'), paidOff: count('paidOff'), absent, unmarked, missed, unjoined, left,
        base, rate, deduction, prorated, afterLeft, earned, advances, advance, sharePaid,
        balance: base ? earned - advance - sharePaid : 0
    };
}
