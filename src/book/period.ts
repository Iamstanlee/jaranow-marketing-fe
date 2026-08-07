import type {Role} from './types';
import {dateText, dayFrom, endOfDay, startOfDay} from './format';

// Every list that can span days filters through the same control, so a range learned on one
// page works on the next. A range is a named preset or, for CUSTOM, a pair of yyyy-mm-dd
// days from the two date inputs; either end may be blank, meaning "unbounded on that side"
// rather than "empty range" — half a pair is what you have while you are still typing.
export const CUSTOM = 'Custom range';
export const PERIODS = ['All time', 'Today', 'Yesterday', 'Last 3 days', 'Last 7 days', 'This week', 'This month', 'Last month', 'Last 3 months', 'Last 6 months', '1 year', 'Last year'];
// Staff work a shift, not the books. They need the day they are on and the one before it —
// enough to settle "you charged me twice yesterday" — and nothing further back, so a tablet
// left open at the forecourt is not a window onto months of takings. Admin keeps the full set
// and the custom pair; staff get neither.
export const STAFF_PERIODS = ['Today', 'Yesterday'];
export const periodsFor = (role: Role) => role === 'staff' ? STAFF_PERIODS : PERIODS;

export type Range = { preset: string; from: string; to: string };
export const rangeOf = (preset: string): Range => ({preset, from: '', to: ''});
// What the filter is currently showing, for section subheadings — a report captioned
// "Custom range" says nothing, and these figures get read aloud off the screen.
export const rangeLabel = (range: Range) => range.preset !== CUSTOM ? range.preset
    : range.from && range.to ? `${dateText(range.from)} – ${dateText(range.to)}`
        : range.from ? `From ${dateText(range.from)}`
            : range.to ? `Up to ${dateText(range.to)}` : 'All time';
// usePage resets on this: a range change makes whatever page you were on meaningless.
export const rangeKey = (range: Range) => `${range.preset}|${range.from}|${range.to}`;

export function periodStart(period: string) {
    const now = new Date();
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    if (period === 'Yesterday') d.setDate(d.getDate() - 1); else if (period === 'Last 3 days') d.setDate(d.getDate() - 2); else if (period === 'Last 7 days') d.setDate(d.getDate() - 6); else if (period === 'This week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); else if (period === 'This month') d.setDate(1); else if (period === 'Last month') {
        d.setMonth(d.getMonth() - 1, 1);
    } else if (period === 'Last 3 months') d.setMonth(d.getMonth() - 3); else if (period === 'Last 6 months') d.setMonth(d.getMonth() - 6); else if (period === '1 year') d.setFullYear(d.getFullYear() - 1); else if (period === 'Last year') {
        d.setFullYear(d.getFullYear() - 1, 0, 1);
    }
    return d;
}

export function periodEnd(period: string) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    if (period === 'Yesterday') {
        end.setDate(end.getDate() - 1);
    }
    if (period === 'Last month') {
        end.setDate(0);
    }
    if (period === 'Last year') {
        end.setFullYear(end.getFullYear() - 1, 11, 31);
    }
    return end;
}

export function inPeriod(date: Date, period: string) {
    if (period === 'All time') return true;
    return date >= periodStart(period) && date <= periodEnd(period);
}

export function inRange(date: Date, range: Range) {
    if (range.preset !== CUSTOM) return inPeriod(date, range.preset);
    if (range.from && date < startOfDay(dayFrom(range.from))) return false;
    return !(range.to && date > endOfDay(dayFrom(range.to)));
}
