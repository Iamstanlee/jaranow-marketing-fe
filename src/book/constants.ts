// Everything the desk treats as fixed: the price board, where the end-of-day report goes,
// and the Firestore collections it is allowed to touch (see firestore.rules — the rules and
// this list have to name the same collections).

export const SERVICES = {'Exterior wash': 2000, 'Full wash': 3000, 'Deep/Vacuum wash': 4000} as const;
export type Service = keyof typeof SERVICES;

// Where the end-of-day summary is sent. Digits only — wa.me rejects a leading "+".
export const EOD_REPORT_PHONE = '2347048667650';

export const COLLECTIONS = {
    sales: 'car_wash_sales',
    loyalty: 'car_wash_loyalty',
    expenses: 'car_wash_expenses',
    staff: 'car_wash_staff',
    roster: 'car_wash_roster'
} as const;

// The two things the roster records. "Cleaning" is the bay and the premises — the work that
// is nobody's by default and so has to be someone's by name — and "Off" is the Sunday
// somebody is not expected in. Anything else (who is washing) is what the sales ledger
// already says, so it is deliberately not a duty here.
//
// The two run on different clocks: cleaning is a whole week, off is a single Sunday. See
// src/book/roster.ts, which is where that asymmetry is handled.
export const DUTIES = ['Cleaning', 'Off'] as const;
export type Duty = typeof DUTIES[number];
