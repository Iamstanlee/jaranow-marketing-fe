import {useState} from 'react';
import type {Role} from '../types';
import {periodsFor, type Range, rangeOf} from '../period';

// The range a section is filtering by, held so it can never leave what the role may see.
// PeriodFilter already only offers the allowed presets, but the clamp belongs on the state
// too — a picker is a suggestion, and a section whose range could hold 'All time' for staff
// is one stray setRange away from showing the whole ledger. `preferred` is the section's own
// default, used when the role is allowed it and otherwise falling back to the widest range
// that role has (Today).
export function useRange(role: Role, preferred: string) {
    const allowed = periodsFor(role);
    const [range, setRange] = useState<Range>(() => rangeOf(allowed.includes(preferred) ? preferred : allowed[0]));
    return [range, (next: Range) => {
        if (allowed.includes(next.preset)) setRange(next);
    }] as const;
}
