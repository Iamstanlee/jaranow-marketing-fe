import {addDays, dateOf, dayFrom, isoDay, startOfDay} from './format';
import type {AttendantPay, Attendance, Payout, Sale, Staff} from './types';

// Revenue sharing for car-wash attendants.
//
// The pool is 30% of every wash, worked out DAY BY DAY against who was there. Each day's 30%
// is divided by the attendants marked present that day — salaried and revenue share alike —
// and each revenue-share attendant who was present draws one part. Salaried attendants still
// count towards the divisor; their part simply stays with the business. So on a day three
// attendants turn up and two of them are on revenue share, each of the two takes 10% of
// every wash that day.
//
// Nobody is paid for a day they were not marked present. A day with no attendance marked at
// all therefore pays nobody, which is why the section flags those days rather than letting
// them pass as a quiet day.
export const SHARE_RATE = 0.3;

// The first week revenue sharing applied (a Monday). Nothing before it is owed, so no earlier
// week is listed — otherwise every week of trading before the scheme would show as overdue.
export const SHARE_START = dayFrom('2026-11-02');

export const isAttendant = (person: Staff) => person.active && !!person.attendantPay;
export const onShare = (person: Staff) => isAttendant(person) && person.attendantPay === 'share';

// The fraction of each wash one revenue-share attendant receives on a day `present` worked.
export const sharePerHead = (present: number) => present ? SHARE_RATE / present : 0;

// Weeks run Monday to Sunday and are paid on the Sunday, so the Sunday's own washes are in
// the week being paid.
export const payday = (monday: Date) => addDays(monday, 6);

// Who was at work on a day: the attendants on the team today whose id is on that day's sheet.
export const presentOn = (iso: string, staff: Staff[], attendance: Attendance[]) => {
    const sheet = attendance.find(a => a.day === iso)?.present || [];
    return staff.filter(p => isAttendant(p) && sheet.includes(p.id));
};

export type DayPay = { day: string; date: Date; revenue: number; washes: number; present: string[] };
export type PayLine = {
    staffId: string;
    name: string;
    pay: AttendantPay;
    // Days this week they were marked present.
    days: number;
    // Revenue share owed for the week, or what was paid if `payout` is set. Always 0 for a
    // salaried attendant, whose line is there for the days worked.
    amount: number;
    payout?: Payout;
    // Paid, but the week has moved since — a sale or an attendance mark changed after the
    // payout. Positive is still owed to them; negative was overpaid.
    drift: number;
};
export type WeekPay = {
    week: string;
    monday: Date;
    revenue: number;
    washes: number;
    days: DayPay[];
    // Days already over with nobody marked present.
    unmarked: Date[];
    lines: PayLine[];
};

// One week, Monday to Sunday. Naira are whole, so each person's amount is rounded once, for
// the week — rounding per wash or per day would lose up to a naira each time.
//
// An UNPAID week follows today's attendant settings: changing how somebody is paid re-works
// every unpaid week. A PAID line is the payout as written and is never re-cut.
export function weekPay(monday: Date, sales: Sale[], staff: Staff[], payouts: Payout[], attendance: Attendance[], today = new Date()): WeekPay {
    const start = startOfDay(monday), week = isoDay(start);
    const days: DayPay[] = Array.from({length: 7}, (_, i) => {
        const date = addDays(start, i), day = isoDay(date);
        const daySales = sales.filter(s => isoDay(dateOf(s)) === day);
        return {
            day, date,
            revenue: daySales.reduce((sum, s) => sum + s.amount, 0),
            washes: daySales.length,
            present: presentOn(day, staff, attendance).map(p => p.id)
        };
    });
    const earned = (id: string) => Math.round(days.reduce((sum, d) =>
        d.present.includes(id) ? sum + d.revenue * sharePerHead(d.present.length) : sum, 0));
    const worked = (id: string) => days.filter(d => d.present.includes(id)).length;
    const paid = payouts.filter(p => p.week === week);

    const lines: PayLine[] = staff.filter(isAttendant).map(person => {
        const payout = paid.find(p => p.staffId === person.id);
        const owed = person.attendantPay === 'share' ? earned(person.id) : 0;
        return {
            staffId: person.id, name: person.name, pay: person.attendantPay!, days: worked(person.id),
            amount: payout ? payout.amount : owed, payout, drift: payout ? owed - payout.amount : 0
        };
    });
    // Somebody paid for the week who has since left the pool or the team still appears: a
    // week's record of who was paid does not depend on who is on the team today.
    paid.filter(p => !lines.some(l => l.staffId === p.staffId)).forEach(p => lines.push({
        staffId: p.staffId, name: staff.find(s => s.id === p.staffId)?.name || p.staffName, pay: 'share',
        days: p.days, amount: p.amount, payout: p, drift: 0
    }));
    // Revenue share first — they are the lines with money on them — then by name.
    lines.sort((a, b) => (a.pay === b.pay ? 0 : a.pay === 'share' ? -1 : 1) || a.name.localeCompare(b.name));

    const todayStart = startOfDay(today).getTime();
    return {
        week, monday: start, days, lines,
        revenue: days.reduce((sum, d) => sum + d.revenue, 0),
        washes: days.reduce((sum, d) => sum + d.washes, 0),
        unmarked: days.filter(d => d.date.getTime() < todayStart && !d.present.length).map(d => d.date)
    };
}
