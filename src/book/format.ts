import type {Loyalty, Timestamp} from './types';

// Intl formatters are expensive to construct and these run per row, so build each once.
const NAIRA = new Intl.NumberFormat('en-NG', {style: 'currency', currency: 'NGN', maximumFractionDigits: 0});
const LONG_DATE = new Intl.DateTimeFormat('en-NG', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
// hour12 explicit: en-NG resolves 12/24h differently across browsers.
const TIME = new Intl.DateTimeFormat('en-NG', {hour: 'numeric', minute: '2-digit', hour12: true});
const DAY_MONTH = new Intl.DateTimeFormat('en-NG', {day: 'numeric', month: 'short'});
const DAY_MONTH_YEAR = new Intl.DateTimeFormat('en-NG', {day: 'numeric', month: 'short', year: 'numeric'});

export const money = (value: number) => NAIRA.format(value);
// Called at render, not module load: the desk stays open past midnight.
export const longDate = () => LONG_DATE.format(new Date());
export const greeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};
// A record still waiting on serverTimestamp has no createdAt yet; treat it as now.
export const dateOf = (record: { createdAt?: Timestamp }) => record.createdAt?.toDate() || new Date();
export const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};
export const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};
export const startOfWeek = (date: Date) => {
    const d = startOfDay(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
    return d;
};
export const startOfMonth = (date: Date) => {
    const d = startOfDay(date);
    d.setDate(1);
    return d;
};
export const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};
export const timeLabel = (date: Date) => TIME.format(date);
export const dayLabel = (date: Date) => {
    const day = startOfDay(date).getTime(), edge = startOfDay(new Date());
    if (day === edge.getTime()) return 'Today';
    edge.setDate(edge.getDate() - 1);
    if (day === edge.getTime()) return 'Yesterday';
    return (date.getFullYear() === new Date().getFullYear() ? DAY_MONTH : DAY_MONTH_YEAR).format(date);
};
export const codeFor = (member: Loyalty, index: number) => member.code || `LOY-${String(index + 1).padStart(3, '0')}`;
// Local yyyy-mm-dd. toISOString() is UTC and would date the last hour of a Lagos day as tomorrow.
export const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
// Local midnight. `new Date('2026-08-02')` parses as UTC and shifts a day west of Greenwich.
export const dayFrom = (iso: string) => new Date(`${iso}T00:00:00`);
export const dateText = (iso: string) => DAY_MONTH_YEAR.format(dayFrom(iso));

/** A share (0–1) as a percentage: one decimal under 10%, so small slices don't all read "0%". */
export const percent = (share: number) => {
    const value = share * 100;
    if (value > 0 && value < 0.1) return '<0.1%';
    return `${value.toFixed(value < 10 && value > 0 ? 1 : 0)}%`;
};
