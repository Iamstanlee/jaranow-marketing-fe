import type {Duty, LeftReason, OffDay, Service} from './constants';

export type Timestamp = { toDate: () => Date };
export type Sale = {
    id: string;
    loyaltyCode: string;
    customer: string;
    service: Service;
    payment: string;
    amount: number;
    redeemed?: boolean;
    // Rug sales only: who to call when the rug is ready.
    phone?: string;
    // Rug sales only, from nextRugTag; the balance payment carries the same one.
    tag?: string;
    // A rug taken on a deposit: `amount` is what was paid upfront, `balance` what is still owed.
    // Present (0 once settled) only on a deposit sale.
    balance?: number;
    // The balance payment, a sale of its own on the day it is collected; names the deposit sale.
    balanceOf?: string;
    createdAt?: Timestamp
};
export type SalePatch = Pick<Sale, 'service' | 'payment' | 'amount' | 'balance'>;
export type Loyalty = { id: string; code?: string; customer: string; phone: string; points: number; redeemed: number };
export type Expense = { id: string; category: string; note: string; payment: string; amount: number; createdAt?: Timestamp };
export type Staff = {
    id: string;
    name: string;
    phone: string;
    // false = archived: kept so their name stays on past rota weeks.
    active: boolean;
    // Rotations they sit out. Stored as the exception so an absent field means "takes every turn".
    exempt?: Duty[];
    // Their weekly day off. Absent = given the least-taken quiet day (roster.ts `offDays`).
    offDay?: OffDay;
    // Absent = cashier (fixed salary, not on the attendance sheet or in the share pool).
    attendantPay?: AttendantPay;
    salary?: number;
    advances?: Advance[];
    // yyyy-mm-dd, set by hand. Absent = the day they were added (createdAt). Days off and salary
    // start here; turn order stays on createdAt so correcting it reshuffles nobody.
    joinedOn?: string;
    // Set on archive, cleared on restore: what tenure and retention are measured from.
    leftAt?: string;
    leftReason?: LeftReason;
    applicantId?: string;
    createdAt?: Timestamp
};
// `at` is epoch ms: Firestore allows no serverTimestamp inside an array.
export type Advance = { id: string; amount: number; at: number };
export type AttendantPay = 'salary' | 'share';
// One person's revenue share for one week. `week` is the Monday (yyyy-mm-dd); the inputs are
// stored beside the amount so a paid week still reads correctly after the team or sales change.
export type Payout = {
    id: string;
    week: string;
    staffId: string;
    staffName: string;
    amount: number;
    revenue: number;
    washes: number;
    days: number;
    rate: number;
    payment: string;
    // The Staff expense written in the same batch.
    expenseId?: string;
    createdAt?: Timestamp
};
// `day` is a local yyyy-mm-dd: the Monday for Cleaning, the date itself for Off — see roster.ts. `staffName` is a fallback for a person since removed.
export type RosterEntry = {
    id: string;
    day: string;
    staffId: string;
    staffName: string;
    duty: Duty;
    note?: string;
    createdAt?: Timestamp
};
// One document per day, keyed by the day, so two tablets write the same record. Lists are
// updated with arrayUnion/arrayRemove; a person is on at most one of them.
export type Attendance = {
    id: string;
    day: string;
    present: string[];
    absent?: string[];
    paidOff?: string[];
    updatedAt?: Timestamp
};
export type ApplicantStage = 'new' | 'training' | 'bench' | 'hired' | 'declined';
// Written by the /careers form; the option strings come from src/data/hiring.ts.
export type Applicant = {
    id: string;
    name: string;
    phone: string;
    area: string;
    start: string;
    experience: string;
    fullDay: string;
    source: string;
    // The link they applied from (?src=), if it carried one.
    src?: string;
    stage: ApplicantStage;
    // First of the two training days, local yyyy-mm-dd.
    trainingFrom?: string;
    notes?: string;
    staffId?: string;
    createdAt?: Timestamp
};
export type Role = 'admin' | 'staff';
export type Section = 'overview' | 'sales' | 'loyalty' | 'expenses' | 'roster' | 'eod' | 'reports' | 'payments' | 'hiring';
