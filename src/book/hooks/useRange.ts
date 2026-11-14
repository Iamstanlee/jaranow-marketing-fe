import {useState} from 'react';
import type {Role} from '../types';
import {periodsFor, type Range, rangeOf} from '../period';

// A section's range, clamped to the role's presets on the state itself, not just the picker.
export function useRange(role: Role, preferred: string) {
    const allowed = periodsFor(role);
    const [range, setRange] = useState<Range>(() => rangeOf(allowed.includes(preferred) ? preferred : allowed[0]));
    return [range, (next: Range) => {
        if (allowed.includes(next.preset)) setRange(next);
    }] as const;
}
