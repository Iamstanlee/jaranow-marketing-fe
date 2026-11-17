import {DUTIES, type Duty, OFF_DAYS, type OffDay} from './constants';
import {addDays, dayFrom, isoDay, startOfDay, startOfWeek} from './format';
import type {RosterEntry, Staff} from './types';

// Cleaning is a WEEK (anchored on its Monday); Off is the day itself.
export const slotOf = (duty: Duty, date: Date) => isoDay(duty === 'Cleaning' ? startOfWeek(date) : date);
// One entry per person per duty per week, whatever day it sits on.
export const sameSlot = (a: Pick<RosterEntry, 'day' | 'duty' | 'staffId'>, b: Pick<RosterEntry, 'day' | 'duty' | 'staffId'>) =>
    a.duty === b.duty && a.staffId === b.staffId && isoDay(startOfWeek(dayFrom(a.day))) === isoDay(startOfWeek(dayFrom(b.day)));

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

// Exemptions apply to one duty at a time.
export const inRotation = (person: Staff, duty: Duty) => person.active && !(person.exempt || []).includes(duty);

// The order they were added, so a newcomer goes to the end instead of reshuffling everyone's turn or day.
const added = (person: Staff) => person.createdAt?.toDate().getTime() ?? 0;
export const rotation = (staff: Staff[], duty: Duty) => staff.filter(p => inRotation(p, duty))
    .sort((a, b) => added(a) - added(b) || a.name.localeCompare(b.name));
// Midnight of their first day. A missing createdAt (pending write) counts as always on the team.
export const joinedAt = (person: Staff) => person.joinedOn ? dayFrom(person.joinedOn).getTime()
    : person.createdAt ? startOfDay(person.createdAt.toDate()).getTime() : 0;

// Weeks before the epoch give a negative turn, and JS % keeps the sign.
const turnAt = (order: Staff[], turn: number) => order[((turn % order.length) + order.length) % order.length];
// --- Weekly days off ---------------------------------------------------------------------
const OFFSET: Record<OffDay, number> = {Monday: 0, Tuesday: 1, Sunday: 6};
const isOffDay = (day: unknown): day is OffDay => OFF_DAYS.includes(day as OffDay);
const count = (days: OffDay[]) => OFF_DAYS.map(d => days.filter(x => x === d).length);
const leastOf = (days: OffDay[]) => {
    const counts = count(days);
    return OFF_DAYS[counts.indexOf(Math.min(...counts))];
};

// A stored `offDay` is kept; anyone without one takes the least-taken day, in join order, so the
// team stays spread over the quiet days.
export const offDays = (staff: Staff[]): { person: Staff; day: OffDay }[] => {
    const order = rotation(staff, 'Off');
    const taken = order.map(p => p.offDay).filter(isOffDay);
    return order.map(person => {
        if (isOffDay(person.offDay)) return {person, day: person.offDay};
        const day = leastOf(taken);
        taken.push(day);
        return {person, day};
    });
};
// What a newcomer (or `person`, re-picking) should default to.
export const quietestDay = (staff: Staff[], person?: Staff) =>
    leastOf(offDays(staff.filter(p => p.id !== person?.id)).map(o => o.day));
export const offCount = (staff: Staff[], day: OffDay, person?: Staff) =>
    offDays(staff).filter(o => o.day === day && o.person.id !== person?.id).length;

// Swaps are not consulted: the rotation is derived from the team alone.
export const cleanerFor = (monday: Date, staff: Staff[]): Staff | null => {
    const order = rotation(staff, 'Cleaning');
    return order.length ? turnAt(order, weekNumber(monday)) : null;
};

// A derived turn, shaped like a stored entry and never written; `auto` marks it.
export type Assignment = RosterEntry & { auto?: boolean };
const turnOf = (duty: Duty, day: string, person: Staff): Assignment =>
    ({id: `auto:${duty}:${day}`, day, duty, staffId: person.id, staffName: person.name, auto: true});

// A cleaning swap replaces the week's turn outright; an Off swap moves only that person's day.
export const weekRoster = (roster: RosterEntry[], staff: Staff[], monday: Date) => {
    const week = isoDay(monday), sunday = isoDay(addDays(monday, 6));
    const swapped = ordered(roster.filter(r => r.duty === 'Cleaning' && r.day === week), staff);
    const cleaner = cleanerFor(monday, staff);
    const cleaning: Assignment[] = swapped.length ? swapped : cleaner ? [turnOf('Cleaning', week, cleaner)] : [];
    const moved = roster.filter(r => r.duty === 'Off' && r.day >= week && r.day <= sunday);
    // No day off before they joined.
    const standing = offDays(staff).filter(({person}) => !moved.some(r => r.staffId === person.id))
        .map(({person, day}) => ({person, date: addDays(monday, OFFSET[day])}))
        .filter(({person, date}) => date.getTime() >= joinedAt(person))
        .map(({person, date}) => turnOf('Off', isoDay(date), person));
    const off: Assignment[] = [...moved, ...standing].sort((a, b) => a.day.localeCompare(b.day) || nameOf(a, staff).localeCompare(nameOf(b, staff)));
    return {week, cleaning, off};
};
