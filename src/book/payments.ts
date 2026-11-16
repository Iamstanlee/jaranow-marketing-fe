import {addDays, dateOf, dayFrom, isoDay, startOfDay} from './format';
import type {AttendantPay, Attendance, Payout, Sale, Staff} from './types';

// Revenue share: 30% of each day's washes, divided by the attendants marked present that day
// (salaried ones included), with one part to each present revenue-share attendant. A salaried
// attendant's part stays with the business. No mark, no pay.
export const SHARE_RATE = 0.3;

// The first Monday revenue sharing applied; nothing earlier is owed.
export const SHARE_START = dayFrom('2026-11-02');

// The first day attendance counts. Salaries run by calendar month, hence the 1st.
export const ATTENDANCE_START = dayFrom('2026-11-01');

// A blank is never read as an absence — only a mark is.
export type Mark = 'present' | 'absent' | 'leave';
export const markOn = (iso: string, id: string, attendance: Attendance[]): Mark | null => {
    const sheet = attendance.find(a => a.day === iso);
    return sheet?.present.includes(id) ? 'present' : sheet?.paidOff?.includes(id) ? 'leave' : sheet?.absent?.includes(id) ? 'absent' : null;
};

export const isAttendant = (person: Staff) => person.active && !!person.attendantPay;
export const onShare = (person: Staff) => isAttendant(person) && person.attendantPay === 'share';

export const sharePerHead = (present: number) => present ? SHARE_RATE / present : 0;

// Weeks run Monday to Sunday and are paid on the Sunday.
export const payday = (monday: Date) => addDays(monday, 6);

export const presentOn = (iso: string, staff: Staff[], attendance: Attendance[]) => {
    const sheet = attendance.find(a => a.day === iso)?.present || [];
    return staff.filter(p => isAttendant(p) && sheet.includes(p.id));
};

// Revenue and wash count per local day, built once per sales array rather than once per day
// asked for — Payments asks for dozens of days across the weeks and months it shows.
type DayTotal = { revenue: number; washes: number };
const dayIndex = new WeakMap<Sale[], Map<string, DayTotal>>();
const totalsByDay = (sales: Sale[]) => {
    let index = dayIndex.get(sales);
    if (!index) {
        index = new Map();
        for (const s of sales) {
            const key = isoDay(dateOf(s)), entry = index.get(key), washes = s.balanceOf ? 0 : 1;
            if (entry) {
                entry.revenue += s.amount;
                entry.washes += washes;
            } else index.set(key, {revenue: s.amount, washes});
        }
        dayIndex.set(sales, index);
    }
    return index;
};

export type DayPay = { day: string; date: Date; revenue: number; washes: number; present: string[] };
export type PayLine = {
    staffId: string;
    name: string;
    pay: AttendantPay;
    days: number;
    // Owed, or what was paid if `payout` is set. Always 0 for a salaried attendant.
    amount: number;
    payout?: Payout;
    // Paid, but the week has changed since: positive is still owed, negative was overpaid.
    drift: number;
};
export type WeekPay = {
    week: string;
    monday: Date;
    revenue: number;
    washes: number;
    days: DayPay[];
    // Past days with nobody marked present.
    unmarked: Date[];
    lines: PayLine[];
};

// Each amount is rounded once for the week. An unpaid week follows today's pay settings; a
// paid line is the payout as written.
export function weekPay(monday: Date, sales: Sale[], staff: Staff[], payouts: Payout[], attendance: Attendance[], today = new Date()): WeekPay {
    const start = startOfDay(monday), week = isoDay(start), byDay = totalsByDay(sales);
    const days: DayPay[] = Array.from({length: 7}, (_, i) => {
        const date = addDays(start, i), day = isoDay(date), total = byDay.get(day);
        return {
            day, date,
            revenue: total?.revenue ?? 0,
            washes: total?.washes ?? 0,
            present: presentOn(day, staff, attendance).map(p => p.id)
        };
    });
    const earned = (id: string) => Math.round(days.reduce((sum, d) =>
        d.present.includes(id) ? sum + d.revenue * sharePerHead(d.present.length) : sum, 0));
    const worked = (id: string) => days.filter(d => d.present.includes(id)).length;
    const paid = payouts.filter(p => p.week === week);

    const lines: PayLine[] = staff.filter(isAttendant).map(person => {
        const payout = paid.find(p => p.staffId === person.id);
        // A payout keeps the line a share line after a move to salary.
        const share = person.attendantPay === 'share' || !!payout;
        const owed = share ? earned(person.id) : 0;
        return {
            staffId: person.id, name: person.name, pay: share ? 'share' : person.attendantPay!, days: worked(person.id),
            amount: payout ? payout.amount : owed, payout, drift: payout ? owed - payout.amount : 0
        };
    });
    // Paid people who have since left the pool or the team still appear.
    paid.filter(p => !lines.some(l => l.staffId === p.staffId)).forEach(p => lines.push({
        staffId: p.staffId, name: staff.find(s => s.id === p.staffId)?.name || p.staffName, pay: 'share',
        days: p.days, amount: p.amount, payout: p, drift: 0
    }));
    lines.sort((a, b) => (a.pay === b.pay ? 0 : a.pay === 'share' ? -1 : 1) || a.name.localeCompare(b.name));

    const todayStart = startOfDay(today).getTime();
    return {
        week, monday: start, days, lines,
        revenue: days.reduce((sum, d) => sum + d.revenue, 0),
        washes: days.reduce((sum, d) => sum + d.washes, 0),
        unmarked: days.filter(d => d.date.getTime() < todayStart && !d.present.length).map(d => d.date)
    };
}
