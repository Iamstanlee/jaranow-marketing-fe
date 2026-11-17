// The price board, in printed order. Must match `LISTS` in brand/gen-pricelist.js — customers
// read the laminated sheet and are charged from this menu.
export const SERVICES = {
    'Body wash': 2000,
    'Full wash': 3000,
    'Wash & vacuum': 4000,
    'Full wash + engine': 7000,
    'Deep wash': 10000,
    'Buffing & polish': 20000,
    'Premium detailing': 35000,
    'Small rug': 10000,
    'Medium rug': 15000,
    'Large rug': 20000,
} as const;
export type Service = keyof typeof SERVICES;

// Rugs earn no loyalty point and cannot be the free wash.
const RUGS: readonly Service[] = ['Small rug', 'Medium rug', 'Large rug'];
export const isRug = (service: Service) => RUGS.includes(service);
export const earnsPoints = (service: Service) => !isRug(service);

// Stored sales keep the name they were sold under; map renamed services to today's name.
const RENAMED: Record<string, Service> = {
    'Exterior wash': 'Body wash',
    'Deep/Vacuum wash': 'Wash & vacuum'
};
export const currentService = (name: string) => RENAMED[name] ?? (name as Service);

export const EOD_REPORT_PHONE = '2347048667650';

// Must name the same collections as firestore.rules.
export const COLLECTIONS = {
    sales: 'car_wash_sales',
    loyalty: 'car_wash_loyalty',
    expenses: 'car_wash_expenses',
    staff: 'car_wash_staff',
    roster: 'car_wash_roster',
    payouts: 'car_wash_payouts',
    attendance: 'car_wash_attendance',
    applicants: 'car_wash_applicants'
} as const;

export const EXPENSE_CATEGORIES = ['Detergent/Soap', 'Water', 'Fuel', 'Supplies', 'Transport', 'Staff', 'Utilities', 'Maintenance', 'Other'] as const;
export const PAYMENT_METHODS = ['Cash', 'Transfer', 'POS'] as const;

export const DUTIES = ['Cleaning', 'Off'] as const;
export type Duty = typeof DUTIES[number];

// The quiet days, in week order, which is also the tie-break when spreading the team over them.
export const OFF_DAYS = ['Monday', 'Tuesday', 'Sunday'] as const;
export type OffDay = typeof OFF_DAYS[number];

// How many recent documents each live listener reads; older ones are fetched on demand
// (useBook's history). Loyalty and staff are read whole: codeFor numbers members by position,
// so a truncated loyalty list would hand out somebody else's code.
export const LIVE_WINDOW = {sales: 300, owing: 100, expenses: 300, roster: 400, payouts: 400, attendance: 120, applicants: 300} as const;

export const LEFT_REASONS = ['Resigned', 'Stopped coming', 'Let go', 'Other'] as const;
export type LeftReason = typeof LEFT_REASONS[number];
