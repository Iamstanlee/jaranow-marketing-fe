// Everything the desk treats as fixed: the price board, where the end-of-day report goes,
// and the Firestore collections it is allowed to touch (see firestore.rules — the rules and
// this list have to name the same collections).

// The board, in the order it is printed. The authority is the `LISTS` array in
// brand/gen-pricelist.js — the laminated A4 on the wall and this menu have to agree, because a
// customer reads one and is charged from the other. Change a price there and here together.
//
// Rug washing is on the printed list, so it is sellable at the desk too. It does inflate
// "cars per day" in Reports, which counts sales rather than cars — a rug is not a car.
export const SERVICES = {
    'Body wash': 2000,
    'Full wash': 3000,
    'Wash & vacuum': 4000,
    'Full wash + engine': 7000,
    'Deep wash': 10000,
    'Buffing & polish': 20000,
    'Premium detailing': 35000,
} as const;
export type Service = keyof typeof SERVICES;

// Two services were renamed when the board grew, and every sale already in Firestore carries
// the name it was sold under. Nothing rewrites those documents, so the old strings have to keep
// resolving: without this they drop out of the Reports breakdown (which matches on the name)
// and an old sale opened for editing shows a service it was not.
const RENAMED: Record<string, Service> = {
    'Exterior wash': 'Body wash',
    'Deep/Vacuum wash': 'Wash & vacuum'
};
export const currentService = (name: string) => RENAMED[name] ?? (name as Service);

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
