import {dayFrom} from './format';
import {monthPay} from './salary';
import type {Advance, Attendance, Payout, RosterEntry, Staff} from './types';

const person = (id: string, salary?: number, advances?: Advance[]): Staff => ({
    id, name: id.toUpperCase(), phone: '', active: true, attendantPay: 'salary', salary, advances
});
const sheet = (day: string, ...present: string[]): Attendance => ({id: day, day, present});
const off = (day: string, staffId: string): RosterEntry => ({id: `${day}-${staffId}`, day, staffId, staffName: staffId, duty: 'Off'});
const november = dayFrom('2026-11-01');
// Mon 2 – Sun 8 November, seen from Monday the 9th.
const today = dayFrom('2026-11-09');
const statuses = (pay: ReturnType<typeof monthPay>) => pay.days.slice(0, 9).map(d => d.status);

describe('monthPay', () => {
    const a = person('a', 60000), b = person('b', 60000), team = [a, b];
    // A in Mon–Wed and the weekend, and marked absent on Friday; B in every marked day but
    // Sunday. Thursday nobody was marked.
    const attendance = [
        sheet('2026-11-02', 'a', 'b'), sheet('2026-11-03', 'a', 'b'), sheet('2026-11-04', 'a', 'b'),
        {...sheet('2026-11-06', 'b'), absent: ['a']}, sheet('2026-11-07', 'a', 'b'), sheet('2026-11-08', 'a')
    ];
    // B's days off are moved to both Sundays.
    const roster = [off('2026-11-01', 'b'), off('2026-11-08', 'b')];

    it('deducts a day\'s rate for each absence and each unmarked day, and nothing for days ahead', () => {
        const pay = monthPay(a, november, team, attendance, roster, [], today);
        expect(statuses(pay)).toEqual(['unmarked', 'worked', 'worked', 'worked', 'unmarked', 'absent', 'worked', 'worked', 'upcoming']);
        expect([pay.worked, pay.absent, pay.unmarked, pay.off]).toEqual([5, 1, 2, 0]);
        // ₦60,000 over 30 days is ₦2,000 a day; one absence and two unmarked days.
        expect([pay.missed, pay.base, pay.deduction, pay.earned]).toEqual([3, 60000, 6000, 54000]);
    });

    it('does not count a day off moved to Sunday as an absence', () => {
        const pay = monthPay(b, november, team, attendance, roster, [], today);
        expect(pay.days[7].status).toBe('off');
        // Thursday the 5th is unmarked for B too.
        expect([pay.absent, pay.off, pay.earned]).toEqual([0, 2, 58000]);
    });

    it('does not deduct a paid day off', () => {
        // Friday the 6th, the day A was otherwise absent.
        const sick = attendance.map(s => s.day === '2026-11-06' ? {...s, absent: [], paidOff: ['a']} : s);
        const pay = monthPay(a, november, team, sick, roster, [], today);
        expect(pay.days[5].status).toBe('paidOff');
        expect([pay.absent, pay.paidOff, pay.earned]).toEqual([0, 1, 56000]);
    });

    it('reads a day marked absent as absent even when nobody else was marked', () => {
        // Thursday the 5th has no sheet at all; marking A absent on it is a decision.
        const pay = monthPay(a, november, team, [...attendance, {id: '2026-11-05', day: '2026-11-05', present: [], absent: ['a']}], roster, [], today);
        expect(pay.days[4].status).toBe('absent');
        expect([pay.absent, pay.unmarked, pay.earned]).toEqual([2, 1, 54000]);
        // B was not marked that day, which reads as unmarked rather than absent.
        expect(monthPay(b, november, team, [...attendance, {id: '2026-11-05', day: '2026-11-05', present: [], absent: ['a']}], roster, [], today).days[4].status).toBe('unmarked');
    });

    it('counts from the 1st of the month', () => {
        const pay = monthPay(a, november, team, [...attendance, {...sheet('2026-11-01', 'b'), absent: ['a']}], roster, [], today);
        expect(pay.days[0].status).toBe('absent');
        expect(pay.absent).toBe(2);
    });

    it('reads a blank as unmarked, not absent, even on a day others were marked in', () => {
        // Wednesday the 4th with A left off the sheet.
        const blank = attendance.map(s => s.day === '2026-11-04' ? sheet('2026-11-04', 'b') : s);
        const pay = monthPay(a, november, team, blank, roster, [], today);
        expect(pay.days[3].status).toBe('unmarked');
        expect(pay.absent).toBe(1);
    });

    it('counts today as worked once marked in', () => {
        const pay = monthPay(a, november, team, [...attendance, sheet('2026-11-09', 'a')], roster, [], today);
        expect(pay.days[8].status).toBe('worked');
    });

    it('takes the month\'s advances off the balance, not off what was earned', () => {
        const at = (iso: string) => new Date(iso).getTime();
        // Two in November, entered out of order, and one in December that must not count.
        const taken = [
            {id: 'x', amount: 15000, at: at('2026-11-20T09:30:00')}, {id: 'y', amount: 5000, at: at('2026-11-05T16:00:00')},
            {id: 'z', amount: 9000, at: at('2026-12-01T00:00:00')}
        ];
        const pay = monthPay(person('a', 60000, taken), november, team, attendance, roster, [], today);
        expect(pay.advances.map(a => a.id)).toEqual(['y', 'x']);
        expect([pay.earned, pay.advance, pay.balance]).toEqual([54000, 20000, 34000]);
    });

    it('takes revenue share already paid that month off the balance', () => {
        const paid = (week: string, staffId: string, amount: number): Payout => ({
            id: `${week}-${staffId}`, week, staffId, staffName: staffId, amount, revenue: 0, washes: 0, days: 0, rate: 0.3, payment: 'Cash'
        });
        // A was paid ₦7,000 for the week of 2 Nov before moving to salary. The week of 26 Oct
        // paid out on Sunday 1 Nov, so it counts in November; the week of 30 Nov pays out in
        // December and does not. B's payout is not A's.
        const payouts = [paid('2026-11-02', 'a', 7000), paid('2026-10-26', 'a', 1000), paid('2026-11-30', 'a', 4000), paid('2026-11-02', 'b', 9000)];
        const pay = monthPay(a, november, team, attendance, roster, payouts, today);
        expect([pay.earned, pay.sharePaid, pay.balance]).toEqual([54000, 8000, 46000]);
    });

    it('pays a cashier a fixed salary, with no days or absences', () => {
        const cashier: Staff = {id: 'k', name: 'K', phone: '', active: true, salary: 60000, advances: [{id: 'x', amount: 10000, at: new Date('2026-11-05T10:00:00').getTime()}]};
        const pay = monthPay(cashier, november, [...team, cashier], attendance, roster, [], today);
        expect([pay.days.length, pay.absent, pay.earned, pay.balance]).toEqual([0, 0, 60000, 50000]);
    });

    it('still counts the days when no base salary is set', () => {
        const pay = monthPay(person('a'), november, team, attendance, roster, [], today);
        expect([pay.worked, pay.absent, pay.base, pay.earned, pay.balance]).toEqual([5, 1, 0, 0, 0]);
    });
});

describe('monthPay from the weekly day off', () => {
    it('does not deduct their own day off, and still deducts every other unmarked day', () => {
        // A takes Mondays, B Tuesdays; nobody was marked Mon 23 – Sun 29 November.
        const a = person('a', 60000), b = person('b', 60000), pay = monthPay(a, november, [a, b], [], [], [], dayFrom('2026-11-30'));
        const status = (day: string) => pay.days.find(d => d.day === day)!.status;
        expect(status('2026-11-23')).toBe('off');
        expect(status('2026-11-24')).toBe('unmarked');
        expect(status('2026-11-29')).toBe('unmarked');
    });
});

describe('monthPay before they joined', () => {
    it('does not pay or count as missed the days before they were added, and marks still win', () => {
        // Added Wed 4 Nov; marked present on the 3rd (worked before being entered), nothing else marked.
        const late: Staff = {...person('l', 60000), createdAt: {toDate: () => new Date('2026-11-04T15:00:00')}};
        const pay = monthPay(late, november, [late], [sheet('2026-11-03', 'l')], [], [], today);
        expect(statuses(pay)).toEqual(['unjoined', 'unjoined', 'worked', 'unmarked', 'unmarked', 'unmarked', 'unmarked', 'unmarked', 'upcoming']);
        expect([pay.unjoined, pay.missed]).toEqual([2, 5]);
        // ₦2,000 a day: two days before joining, five unmarked since.
        expect([pay.prorated, pay.deduction, pay.earned]).toEqual([4000, 10000, 46000]);
    });
});

describe('monthPay from the join date', () => {
    it('pro-rates a cashier from the day they joined', () => {
        const cashier: Staff = {id: 'k', name: 'K', phone: '', active: true, salary: 60000, joinedOn: '2026-11-11'};
        const pay = monthPay(cashier, november, [cashier], [], [], [], today);
        // Ten days of November before the 11th, at ₦2,000 a day.
        expect([pay.unjoined, pay.prorated, pay.earned]).toEqual([10, 20000, 40000]);
        expect(monthPay({...cashier, joinedOn: '2026-10-01'}, november, [cashier], [], [], [], today).earned).toBe(60000);
    });

    it('lets a set join date override when they were added', () => {
        const late: Staff = {...person('l', 60000), createdAt: {toDate: () => new Date('2026-11-04T15:00:00')}, joinedOn: '2026-11-01'};
        expect(monthPay(late, november, [late], [], [], [], today).unjoined).toBe(0);
    });
});


describe('monthPay after they left', () => {
    it('pays an archived attendant up to and including their last day', () => {
        const gone: Staff = {...person('g', 60000), active: false, leftAt: '2026-11-05', joinedOn: '2026-10-01'};
        const worked = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].map(d => sheet(d, 'g'));
        const pay = monthPay(gone, november, [gone], worked, [], [], today);
        expect(statuses(pay)).toEqual(['unmarked', 'worked', 'worked', 'worked', 'worked', 'left', 'left', 'left', 'left']);
        // 25 days after the 5th at ₦2,000, and the unmarked 1st.
        expect([pay.left, pay.afterLeft, pay.deduction, pay.earned]).toEqual([25, 50000, 2000, 8000]);
    });

    it('pro-rates an archived cashier to their last day', () => {
        const cashier: Staff = {id: 'k', name: 'K', phone: '', active: false, salary: 60000, joinedOn: '2026-10-01', leftAt: '2026-11-10'};
        expect(monthPay(cashier, november, [cashier], [], [], [], today)).toMatchObject({left: 20, earned: 20000});
    });
});
