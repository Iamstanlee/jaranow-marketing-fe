import {SERVICES} from './constants';
import {addDays, isoDay, startOfWeek} from './format';
import type {Expense, Loyalty, RosterEntry, Sale, Staff} from './types';

// Seed records are strictly for local demo mode. A Firebase-backed business starts empty and
// is populated only by its Firestore collections.

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
    {id: 'p1', name: 'Musa Ibrahim', phone: '0803 111 2233', active: true, exempt: []},
    {id: 'p2', name: 'Blessing Eze', phone: '0806 444 5566', active: true, exempt: []},
    // Carries an exemption so demo mode shows what one looks like on the team list and in the
    // turn order, rather than only the everybody-takes-every-turn case.
    {id: 'p3', name: 'Segun Ola', phone: '', active: true, exempt: ['Cleaning']}
];

// Anchored to the current week rather than to fixed dates, so demo mode always opens on a
// rota with something in it instead of on an empty week that looks broken. Cleaning entries
// carry the Monday, off entries the Sunday — see src/book/roster.ts.
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
