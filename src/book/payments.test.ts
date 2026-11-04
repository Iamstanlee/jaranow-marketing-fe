import {dayFrom} from './format';
import {weekPay} from './payments';
import type {AttendantPay, Attendance, Payout, Sale, Staff} from './types';

const person = (id: string, attendantPay?: AttendantPay, active = true): Staff => ({
    id, name: id.toUpperCase(), phone: '', active, attendantPay
});
const sale = (iso: string, amount: number): Sale => ({
    id: `${iso}-${amount}`, loyaltyCode: '—', customer: 'Walk-in', service: 'Full wash', payment: 'Cash', amount,
    createdAt: {toDate: () => new Date(`${iso}T12:00:00`)}
});
const sheet = (day: string, ...present: string[]): Attendance => ({id: day, day, present});
const monday = dayFrom('2026-11-02');
const afterWeek = dayFrom('2026-11-10');
const team = [person('a', 'share'), person('b', 'share'), person('c', 'salary'), person('cashier')];
// Monday ₦10,000, Tuesday ₦6,000. The Sunday before and the Monday after are outside the week.
const sales = [sale('2026-11-02', 10000), sale('2026-11-03', 6000), sale('2026-11-09', 4000), sale('2026-11-01', 2000)];
const amounts = (lines: { staffId: string; amount: number; days: number }[]) => lines.map(l => [l.staffId, l.amount, l.days]);

describe('weekPay', () => {
    it('splits each day by the attendants present, paying only revenue share', () => {
        // Monday all three in: 10% each. Tuesday only A and C: 15% each.
        const pay = weekPay(monday, sales, team, [], [sheet('2026-11-02', 'a', 'b', 'c'), sheet('2026-11-03', 'a', 'c')], afterWeek);
        expect(pay.revenue).toBe(16000);
        expect(amounts(pay.lines)).toEqual([['a', 1000 + 900, 2], ['b', 1000, 1], ['c', 0, 2]]);
    });

    it('pays nobody for a day with no attendance, and flags it', () => {
        const pay = weekPay(monday, sales, team, [], [sheet('2026-11-02', 'a')], afterWeek);
        expect(amounts(pay.lines)).toEqual([['a', 3000, 1], ['b', 0, 0], ['c', 0, 0]]);
        expect(pay.unmarked).toHaveLength(6);
    });

    it('ignores marks for people who are not attendants', () => {
        const pay = weekPay(monday, sales, team, [], [sheet('2026-11-02', 'a', 'cashier')], afterWeek);
        expect(pay.lines.find(l => l.staffId === 'a')?.amount).toBe(3000);
    });

    it('keeps a paid line as written and reports what moved since', () => {
        const payout: Payout = {
            id: 'p', week: '2026-11-02', staffId: 'a', staffName: 'A', amount: 900, revenue: 9000, washes: 2,
            days: 1, rate: 0.3, payment: 'Cash'
        };
        const pay = weekPay(monday, sales, [person('a', 'share'), person('gone', undefined, false)],
            [payout, {...payout, id: 'q', staffId: 'gone', staffName: 'Gone'}], [sheet('2026-11-02', 'a')], afterWeek);
        expect(pay.lines.map(l => [l.name, l.amount, l.drift])).toEqual([['A', 900, 2100], ['GONE', 900, 0]]);
    });
});
