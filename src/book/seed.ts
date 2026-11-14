import {SERVICES} from './constants';
import {addDays, isoDay, startOfWeek} from './format';
import type {Attendance, Expense, Loyalty, Payout, RosterEntry, Sale, Staff} from './types';

// Demo mode only (no Firebase config).

export const seedSales: Sale[] = [{
    id: 's1',
    loyaltyCode: 'LOY-001',
    customer: 'Chioma Okafor',
    service: 'Full wash',
    payment: 'Transfer',
    amount: SERVICES['Full wash']
}, {
    id: 's2',
    loyaltyCode: 'LOY-002',
    customer: 'Tunde Adeyemi',
    service: 'Body wash',
    payment: 'POS',
    amount: SERVICES['Body wash']
}, {
    id: 's3',
    loyaltyCode: 'LOY-003',
    customer: 'Amina Bello',
    service: 'Wash & vacuum',
    payment: 'Cash',
    amount: SERVICES['Wash & vacuum']
}];

export const seedLoyalty: Loyalty[] = [{
    id: 'l1',
    code: 'LOY-001',
    customer: 'Chioma Okafor',
    phone: '0803 456 7812',
    points: 4,
    redeemed: 0
}, {id: 'l2', code: 'LOY-002', customer: 'Tunde Adeyemi', phone: '0806 814 2290', points: 5, redeemed: 1}, {
    id: 'l3',
    code: 'LOY-003',
    customer: 'Amina Bello',
    phone: '0812 908 3321',
    points: 2,
    redeemed: 0
}];

export const seedExpenses: Expense[] = [{
    id: 'e1',
    category: 'Supplies',
    note: 'Cleaning materials',
    payment: 'Cash',
    amount: 1200
}];

export const seedStaff: Staff[] = [
    // Three present, two on revenue share: each takes 10%.
    {id: 'p1', name: 'Musa Ibrahim', phone: '0803 111 2233', active: true, exempt: [], attendantPay: 'share'},
    {id: 'p2', name: 'Blessing Eze', phone: '0806 444 5566', active: true, exempt: [], attendantPay: 'share'},
    // Exempt, so demo mode shows an exemption.
    {id: 'p3', name: 'Segun Ola', phone: '', active: true, exempt: ['Cleaning'], attendantPay: 'salary', salary: 60000}
];

// Relative to this week so demo mode always opens on a populated rota.
const monday = startOfWeek(new Date());
const sunday = addDays(monday, 6);
export const seedRoster: RosterEntry[] = [
    {id: 'r1', day: isoDay(monday), staffId: 'p1', staffName: 'Musa Ibrahim', duty: 'Cleaning'},
    {id: 'r2', day: isoDay(sunday), staffId: 'p3', staffName: 'Segun Ola', duty: 'Off'},
    {id: 'r3', day: isoDay(addDays(monday, 7)), staffId: 'p2', staffName: 'Blessing Eze', duty: 'Cleaning'},
    {
        id: 'r4',
        day: isoDay(addDays(sunday, 7)),
        staffId: 'p1',
        staffName: 'Musa Ibrahim',
        duty: 'Off',
        note: 'Family event'
    }
];

export const seedPayouts: Payout[] = [];

export const seedAttendance: Attendance[] = [{id: isoDay(new Date()), day: isoDay(new Date()), present: ['p1', 'p2', 'p3']}];
