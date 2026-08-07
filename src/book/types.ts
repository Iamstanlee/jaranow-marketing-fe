import type {Duty, Service} from './constants';

export type Timestamp = { toDate: () => Date };
export type Sale = {
    id: string;
    loyaltyCode: string;
    customer: string;
    service: Service;
    payment: string;
    amount: number;
    redeemed?: boolean;
    createdAt?: Timestamp
};
export type Loyalty = { id: string; code?: string; customer: string; phone: string; points: number; redeemed: number };
export type Expense = { id: string; category: string; note: string; payment: string; amount: number; createdAt?: Timestamp };
// A person on the rota. `active` archives someone who has left without deleting them, which
// would take their name off every roster day they ever worked.
//
// `exempt` lists the rotations they sit out of — a supervisor who does not take cleaning
// turns, or somebody who works every Sunday by arrangement. It is stored as the exception
// rather than as the inclusion so that an absent field means "takes every turn", which is
// what every staff record written before this existed should mean. Being exempt keeps
// somebody out of the AUTOMATIC turn order only; they can still be swapped into a slot by
// hand, because an exemption is a default rather than a prohibition.
export type Staff = {
    id: string;
    name: string;
    phone: string;
    active: boolean;
    exempt?: Duty[];
    createdAt?: Timestamp
};
// One person's duty in one slot. `day` is a local yyyy-mm-dd (see isoDay) rather than a
// timestamp: a rota is a calendar, and a duty that shifted by a timezone would land a day
// out for the person reading it.
//
// `day` anchors the slot rather than naming a working day — the Monday of the week for
// Cleaning, the Sunday itself for Off, because the two duties run on different clocks. All
// of that lives in src/book/roster.ts; read it before touching this field.
//
// `staffName` is denormalised so an entry still reads after its staff record is gone; a name
// that still resolves is preferred at render, so renaming someone fixes their history too.
export type RosterEntry = {
    id: string;
    day: string;
    staffId: string;
    staffName: string;
    duty: Duty;
    note?: string;
    createdAt?: Timestamp
};
export type Role = 'admin' | 'staff';
export type Section = 'overview' | 'sales' | 'loyalty' | 'expenses' | 'roster' | 'eod' | 'reports';
