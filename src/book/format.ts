import type {Loyalty, Timestamp} from './types';

export const money = (value: number) => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
}).format(value);
// Called during render rather than computed once at module load: the desk is left open on a
// tablet for a whole shift, and a module-level date would still say yesterday after midnight.
export const longDate = () => new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
export const greeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};
// A record still waiting on serverTimestamp has no createdAt yet, so it reads as just-now —
// which is where it was written, and it settles to the server value on the next snapshot.
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
export const isToday = (date: Date) => startOfDay(date).getTime() === startOfDay(new Date()).getTime();
export const startOfWeek = (date: Date) => {
    const d = startOfDay(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday, matching the 'This week' preset
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
// Two washes at the same price on the same day are otherwise indistinguishable in the list,
// which is exactly the pair someone is trying to tell apart when they come to correct one.
// Explicit hour12: the desk is read at a glance, and en-NG resolves 12/24h differently
// across browsers — a list that flips format between devices reads as a different figure.
export const timeLabel = (date: Date) => date.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
});
// Lists span days, so every row carries when it was logged. The two most recent days are
// named — "Today" is what a reader is actually checking for — and older rows get a date.
export const dayLabel = (date: Date) => {
    const day = startOfDay(date).getTime(), edge = startOfDay(new Date());
    if (day === edge.getTime()) return 'Today';
    edge.setDate(edge.getDate() - 1);
    if (day === edge.getTime()) return 'Yesterday';
    return date.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short', ...(date.getFullYear() === new Date().getFullYear() ? {} : {year: 'numeric'})
    });
};
export const codeFor = (member: Loyalty, index: number) => member.code || `LOY-${String(index + 1).padStart(3, '0')}`;
// Local yyyy-mm-dd. toISOString() would be UTC, so any desk east of Greenwich labels
// "today" as tomorrow for its last hour of the day — Lagos is UTC+1.
export const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
// Parsed as local midnight. `new Date('2026-08-02')` is parsed as UTC, which lands on the
// previous day west of Greenwich and would silently shift every custom filter by a day.
export const dayFrom = (iso: string) => new Date(`${iso}T00:00:00`);
export const dateText = (iso: string) => dayFrom(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
});
