import type {Role} from './types';
import {dateText, dayFrom, endOfDay, startOfDay} from './format';

// A preset, or for CUSTOM a pair of yyyy-mm-dd days; a blank end means unbounded on that side.
export const CUSTOM = 'Custom range';
export const PERIODS = ['All time', 'Today', 'Yesterday', 'Last 3 days', 'Last 7 days', 'This week', 'Last week', 'This month', 'Last month', 'Last 3 months', 'Last 6 months', '1 year', 'Last year'];
// Staff see today and yesterday only, so a forecourt tablet is not a window onto months of takings.
export const STAFF_PERIODS = ['Today', 'Yesterday'];
export const periodsFor = (role: Role) => role === 'staff' ? STAFF_PERIODS : PERIODS;

export type Range = { preset: string; from: string; to: string };
export const rangeOf = (preset: string): Range => ({preset, from: '', to: ''});
export const rangeLabel = (range: Range) => range.preset !== CUSTOM ? range.preset
    : range.from && range.to ? `${dateText(range.from)} – ${dateText(range.to)}`
        : range.from ? `From ${dateText(range.from)}`
            : range.to ? `Up to ${dateText(range.to)}` : 'All time';
// usePage resets on this.
export const rangeKey = (range: Range) => `${range.preset}|${range.from}|${range.to}`;

export function periodStart(period: string) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    switch (period) {
        case 'Yesterday': d.setDate(d.getDate() - 1); break;
        case 'Last 3 days': d.setDate(d.getDate() - 2); break;
        case 'Last 7 days': d.setDate(d.getDate() - 6); break;
        case 'This week': d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); break;
        case 'Last week': d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7); break;
        case 'This month': d.setDate(1); break;
        case 'Last month': d.setMonth(d.getMonth() - 1, 1); break;
        case 'Last 3 months': d.setMonth(d.getMonth() - 3); break;
        case 'Last 6 months': d.setMonth(d.getMonth() - 6); break;
        case '1 year': d.setFullYear(d.getFullYear() - 1); break;
        case 'Last year': d.setFullYear(d.getFullYear() - 1, 0, 1); break;
    }
    return d;
}

export function periodEnd(period: string) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    if (period === 'Yesterday') end.setDate(end.getDate() - 1);
    if (period === 'Last week') end.setDate(end.getDate() - ((end.getDay() + 6) % 7) - 1); // the Sunday just gone
    if (period === 'Last month') end.setDate(0);
    if (period === 'Last year') end.setFullYear(end.getFullYear() - 1, 11, 31);
    return end;
}

// 0 means the beginning of the book: All time, or a custom range open at the bottom.
export function rangeStart(range: Range) {
    if (range.preset === CUSTOM) return range.from ? startOfDay(dayFrom(range.from)).getTime() : 0;
    if (range.preset === 'All time') return 0;
    return periodStart(range.preset).getTime();
}

export function rangeEnd(range: Range) {
    if (range.preset === CUSTOM) return range.to ? endOfDay(dayFrom(range.to)).getTime() : Infinity;
    if (range.preset === 'All time') return Infinity;
    return periodEnd(range.preset).getTime();
}

/** Bounds resolved once, so filtering a ledger is a numeric compare per row rather than date maths. */
export function rangeTest(range: Range) {
    const from = rangeStart(range), to = rangeEnd(range);
    return (date: Date) => {
        const at = date.getTime();
        return at >= from && at <= to;
    };
}

// Reports compares each period with the one before it, so it needs one window more history.
export function comparisonStart(range: Range) {
    const from = rangeStart(range);
    if (from === 0) return 0;
    const to = Math.min(rangeEnd(range), endOfDay(new Date()).getTime());
    return from - Math.max(0, to - from);
}
