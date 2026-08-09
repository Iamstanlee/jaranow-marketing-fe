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
