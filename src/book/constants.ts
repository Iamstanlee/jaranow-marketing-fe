// Everything the desk treats as fixed: the price board, where the end-of-day report goes,
// and the Firestore collections it is allowed to touch (see firestore.rules — the rules and
// this list have to name the same collections).

export const SERVICES = {'Exterior wash': 2000, 'Full wash': 3000, 'Deep/Vacuum wash': 4000} as const;
export type Service = keyof typeof SERVICES;

export const EOD_REPORT_PHONE = '2347048667650';

export const COLLECTIONS = {
    sales: 'car_wash_sales',
    loyalty: 'car_wash_loyalty',
    expenses: 'car_wash_expenses',
    staff: 'car_wash_staff',
    roster: 'car_wash_roster'
} as const;

export const EXPENSE_CATEGORIES = ['Detergent/Soap', 'Water', 'Fuel', 'Supplies', 'Transport', 'Staff', 'Utilities', 'Maintenance', 'Other'] as const;

export const DUTIES = ['Cleaning', 'Off'] as const;
export type Duty = typeof DUTIES[number];

// How much of each ledger the live listeners subscribe to. These are the desk's first paint,
// so they read a recent window rather than the whole collection: a year of trading is
// thousands of documents pulled over mobile data before a single figure appears, and the
// sections that open on load — Overview, End of day, the first page of Sales — never look
// past the last few days anyway. Anything older is fetched on demand, once, when a section is
// actually filtered to a period that reaches back past the window (see useBook's history).
//
// A window that comes back short of its limit IS the whole collection, so on a young book
// nothing here changes behaviour and the on-demand path never runs.
//
// Loyalty and staff are deliberately absent — both are unbounded on purpose. The loyalty list
// has to be complete and stably ordered because `codeFor` numbers members by their POSITION
// in it, so a truncated list would hand out codes that belong to somebody else. Staff is a
// dozen rows at most.
export const LIVE_WINDOW = {sales: 300, expenses: 300, roster: 400} as const;
