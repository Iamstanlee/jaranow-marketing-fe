import {DUTIES, type Duty} from './constants';
import {addDays, dayFrom, isoDay, startOfDay, startOfWeek} from './format';
import type {RosterEntry, Staff} from './types';

// Cleaning is a WEEK (anchored on its Monday); Off is a SUNDAY (anchored on the Sunday). Any
// picked date snaps to the slot containing it.
export const sundayOf = (date: Date) => addDays(startOfWeek(date), 6);
export const slotOf = (duty: Duty, date: Date) => isoDay(duty === 'Off' ? sundayOf(date) : startOfWeek(date));

export const weekSpan = (monday: Date) => `${monday.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short'
})} – ${addDays(monday, 6).toLocaleDateString('en-NG', {day: 'numeric', month: 'short', year: 'numeric'})}`;

export const slotLabel = (duty: Duty, iso: string) => duty === 'Off'
    ? dayFrom(iso).toLocaleDateString('en-NG', {weekday: 'long', day: 'numeric', month: 'short'})
    : `week of ${weekSpan(dayFrom(iso))}`;

// The live name wins so a rename fixes history; the stored one covers a removed person.
export const nameOf = (entry: RosterEntry, staff: Staff[]) => staff.find(p => p.id === entry.staffId)?.name || entry.staffName;

export const ordered = (entries: RosterEntry[], staff: Staff[]) => [...entries].sort((a, b) =>
    DUTIES.indexOf(a.duty) - DUTIES.indexOf(b.duty) || nameOf(a, staff).localeCompare(nameOf(b, staff)));

// --- The rotation ------------------------------------------------------------------------
// Derived, not stored: turns are computed from the week and today's active team, so every
// future week is already right and nothing can drift or race. Firestore holds only swaps
// (overrides). A joiner or leaver re-cuts past derived weeks too — acceptable for a plan.
// A fixed Monday epoch keeps the cycle independent of when the desk was adopted.
const EPOCH = dayFrom('2024-01-01');
const WEEK_MS = 604_800_000;
// Math.round so a DST shift elsewhere cannot rotate the team by one.
export const weekNumber = (monday: Date) => Math.round((startOfDay(monday).getTime() - EPOCH.getTime()) / WEEK_MS);

// Separate turn order per duty: exemptions apply to one rotation at a time.
export const inRotation = (person: Staff, duty: Duty) => person.active && !(person.exempt || []).includes(duty);

// Join order, so a newcomer goes to the end instead of reshuffling everyone's turn.
const joined = (person: Staff) => person.createdAt?.toDate().getTime() ?? 0;
export const rotation = (staff: Staff[], duty: Duty) => staff.filter(p => inRotation(p, duty))
    .sort((a, b) => joined(a) - joined(b) || a.name.localeCompare(b.name));

// Weeks before the epoch give a negative turn, and JS % keeps the sign.
const turnAt = (order: Staff[], turn: number) => order[((turn % order.length) + order.length) % order.length];
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

// Cleaning is the plain cycle. Off is that cycle offset by one so the week's cleaner is not
// also off on its Sunday. With exemptions the two lists differ in length and the offset can
// collide; stepping past the clash steals the next person's turn. So one full period —
// lcm(off, cleaning) weeks — is laid out by backtracking search, each run of `n` weeks a
// permutation of the `n` people: everyone is off once every `n` weeks, never twice running.
// Small enough to recompute per call; caching would hold a stale team.
const offPeriod = (staff: Staff[]): Staff[] => {
    const off = rotation(staff, 'Off'), cleaning = rotation(staff, 'Cleaning');
    const n = off.length, span = cleaning.length || 1;
    const length = n / gcd(n, span) * span;
    const cleanerOn = (p: number) => cleaning.length ? turnAt(cleaning, p) : null;
    // `clear`: Sunday off is not the week's cleaner. `apart`: nobody off two Sundays running.
    // Some teams cannot have both; `apart` is dropped first.
    const lay = (apart: boolean, clear: boolean): Staff[] | null => {
        const picks: Staff[] = [];
        // Only a shape with no answer exhausts this.
        let budget = 5000;
        const allowed = (p: number, person: Staff) => {
            if (clear && cleanerOn(p)?.id === person.id) return false;
            if (!apart) return true;
            if (p > 0 && picks[p - 1].id === person.id) return false;
            // The period repeats, so the week after the last one is the first one.
            return !(p > 0 && p === length - 1 && picks[0].id === person.id);
        };
        const fill = (p: number): boolean => {
            if (p === length) return true;
            if (budget-- < 0) return false;
            const taken = picks.slice(p - (p % n), p);
            // Cycle order from whoever's turn it plainly is, so an unconstrained team keeps the plain cycle.
            for (let step = 0; step < n; step++) {
                const person = turnAt(off, p + 1 + step);
                if (taken.some(t => t.id === person.id) || !allowed(p, person)) continue;
                picks[p] = person;
                if (fill(p + 1)) return true;
            }
            picks.length = p;
            return false;
        };
        return fill(0) ? picks : null;
    };
    // Last resort: the plain cycle (a team of one is off on its own cleaning week).
    return lay(true, true) || lay(false, true) || lay(true, false)
        || Array.from({length}, (_, p) => turnAt(off, p + 1));
};

// Swaps are not consulted: the rotation is derived from the team alone.
export const dueFor = (duty: Duty, monday: Date, staff: Staff[]): Staff | null => {
    const order = rotation(staff, duty);
    if (!order.length) return null;
    const week = weekNumber(monday);
    if (duty !== 'Off') return turnAt(order, week);
    const period = offPeriod(staff);
    return period[((week % period.length) + period.length) % period.length];
};

// A derived turn, shaped like a stored entry and never written; `auto` marks it.
export type Assignment = RosterEntry & { auto?: boolean };
const turnOf = (duty: Duty, day: string, person: Staff): Assignment =>
    ({id: `auto:${duty}:${day}`, day, duty, staffId: person.id, staffName: person.name, auto: true});

// A swap replaces the turn for its slot outright.
export const weekRoster = (roster: RosterEntry[], staff: Staff[], monday: Date) => {
    const week = isoDay(monday), sunday = isoDay(sundayOf(monday));
    const slot = (duty: Duty, day: string): Assignment[] => {
        const overrides = ordered(roster.filter(r => r.duty === duty && r.day === day), staff);
        if (overrides.length) return overrides;
        const due = dueFor(duty, monday, staff);
        return due ? [turnOf(duty, day, due)] : [];
    };
    return {week, sunday, cleaning: slot('Cleaning', week), off: slot('Off', sunday)};
};
