import type {Duty, LeftReason, Service} from './constants';

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
export type Staff = {
    id: string;
    name: string;
    phone: string;
    // false = archived: kept so their name stays on past rota weeks.
    active: boolean;
    // Rotations they sit out. Stored as the exception so an absent field means "takes every turn".
    exempt?: Duty[];
    // Absent = cashier (fixed salary, not on the attendance sheet or in the share pool).
    attendantPay?: AttendantPay;
    salary?: number;
    advances?: Advance[];
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
// `day` is a local yyyy-mm-dd that anchors the slot (Monday for Cleaning, Sunday for Off) — see
// roster.ts. `staffName` is a fallback for a person since removed.
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
