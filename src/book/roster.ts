import {DUTIES, type Duty} from './constants';
import {addDays, dayFrom, isoDay, startOfDay, startOfWeek} from './format';
import type {RosterEntry, Staff} from './types';

// The two duties are not the same shape of thing, and the rota only works if that is taken
// seriously rather than flattened into "a duty on a day":
//
//   Cleaning is a WEEK.   Whoever is on it is on it Monday to Sunday, so it is assigned once
//                         per week and asked about as "who has cleaning this week".
//   Off is a SUNDAY.      The bay trades every day (8am–7pm, all week), so the day off is not
//                         a closure — it is one person's turn to be away, and it is Sunday.
//
// Both are stored as one `day` field — the iso date that ANCHORS the slot: the Monday for a
// cleaning week, the Sunday itself for a day off. That keeps one collection and one clash
// rule, and it means any date a picker offers can be snapped to the slot containing it, so a
// mis-tapped Wednesday becomes that week rather than a duty on a day nothing happens on.
export const sundayOf = (date: Date) => addDays(startOfWeek(date), 6);
export const slotOf = (duty: Duty, date: Date) => isoDay(duty === 'Off' ? sundayOf(date) : startOfWeek(date));

export const weekSpan = (monday: Date) => `${monday.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short'
})} – ${addDays(monday, 6).toLocaleDateString('en-NG', {day: 'numeric', month: 'short', year: 'numeric'})}`;

// Names the slot an entry occupies, for toasts and form captions — the two read differently
// enough that one label would be wrong for both.
export const slotLabel = (duty: Duty, iso: string) => duty === 'Off'
    ? dayFrom(iso).toLocaleDateString('en-NG', {weekday: 'long', day: 'numeric', month: 'short'})
    : `week of ${weekSpan(dayFrom(iso))}`;

// The rota is read by person, and only ever by person, so a name that still resolves against
// the team wins over the one denormalised onto the entry — renaming somebody fixes their
// history too. The stored name is the fallback for a person who has since been removed.
export const nameOf = (entry: RosterEntry, staff: Staff[]) => staff.find(p => p.id === entry.staffId)?.name || entry.staffName;

export const ordered = (entries: RosterEntry[], staff: Staff[]) => [...entries].sort((a, b) =>
    DUTIES.indexOf(a.duty) - DUTIES.indexOf(b.duty) || nameOf(a, staff).localeCompare(nameOf(b, staff)));

// --- The rotation ------------------------------------------------------------------------
//
// Nobody assigns the rota. It is a turn-by-turn rotation over the team, DERIVED from the week
// and the list of active people — so it is already right for every week ahead without anyone
// opening the desk, and there is no weekly chore to forget. What is stored in Firestore is
// only the exceptions: an entry exists precisely when somebody overrode the rotation for that
// slot, which is what a swap actually is.
//
// Deriving rather than generating is what keeps this honest. A "fill the next 12 weeks"
// button writes 24 rows that are stale the moment somebody joins, and it silently stops
// working the week nobody presses it. Nothing is written here, so nothing can drift, two
// tablets cannot race each other into duplicate rows, and a rota nobody has looked at since
// March is still correct in June.
//
// The cost, stated plainly: a derived week is computed from TODAY's team, so a person joining
// or being archived re-cuts the weeks already gone as well as the ones to come. That is
// acceptable for a rota and would not be for the ledgers — a rota is a plan for who turns up,
// not a record of what happened, and the weeks anybody actually reads are this one and next.
// Overridden weeks are stored, so a swap that did happen is never re-cut.
//
// A fixed Monday, so the cycle does not depend on when the business happened to start using
// the desk. 1 Jan 2024 was a Monday.
const EPOCH = dayFrom('2024-01-01');
const WEEK_MS = 604_800_000;
// Math.round, not floor on a raw division: Nigeria has no DST, but a clock change anywhere
// else would put a week boundary an hour out and rotate the whole team by one.
export const weekNumber = (monday: Date) => Math.round((startOfDay(monday).getTime() - EPOCH.getTime()) / WEEK_MS);

// Cleaning and the Sunday off are two rotations, and somebody can sit out of one without
// sitting out of the other — a supervisor who takes no cleaning turns still gets Sundays off.
// So the turn order is per duty, not one list shared by both.
export const inRotation = (person: Staff, duty: Duty) => person.active && !(person.exempt || []).includes(duty);

// Join order, not alphabetical. A new person appended to the end of the cycle takes their
// turn after everybody currently in it; inserting them alphabetically would reshuffle whose
// turn it is for everyone above them in the list. Archived and exempt people leave the
// rotation, which is the point of archiving somebody who no longer turns up.
const joined = (person: Staff) => person.createdAt?.toDate().getTime() ?? 0;
export const rotation = (staff: Staff[], duty: Duty) => staff.filter(p => inRotation(p, duty))
    .sort((a, b) => joined(a) - joined(b) || a.name.localeCompare(b.name));

// Whose turn a slot falls to. Off is offset one place along the cycle so the person carrying
// cleaning for the week is not also the one away on its Sunday — with a team of one there is
// nobody else to be, and the same name correctly comes back for both.
//
// Exemptions can make the two cycles different lists, and offsetting within one list is then
// no longer enough to keep those two picks apart: the offset lands on whoever is next in the
// OFF order, who may well be the person the cleaning order chose. So the collision is checked
// for and stepped past. With one shared list this is unreachable — the offset already
// guarantees a different name — so it costs nothing in the ordinary case.
export const dueFor = (duty: Duty, monday: Date, staff: Staff[]): Staff | null => {
    const order = rotation(staff, duty);
    if (!order.length) return null;
    // Weeks before the epoch give a negative turn, and JS % keeps the sign.
    const at = (turn: number) => order[((turn % order.length) + order.length) % order.length];
    const week = weekNumber(monday);
    if (duty !== 'Off') return at(week);
    const pick = at(week + 1);
    const cleaner = dueFor('Cleaning', monday, staff);
    return cleaner && cleaner.id === pick.id && order.length > 1 ? at(week + 2) : pick;
};

// A slot filled by the rotation rather than by a person. It is shaped like a stored entry so
// every reader can treat the two alike, and it is never written — `auto` is what tells the
// UI it is looking at a turn rather than at a decision somebody made.
export type Assignment = RosterEntry & { auto?: boolean };
const turnOf = (duty: Duty, day: string, person: Staff): Assignment =>
    ({id: `auto:${duty}:${day}`, day, duty, staffId: person.id, staffName: person.name, auto: true});

// What the week being viewed says: who has cleaning for it, and who is off on its Sunday.
// An override replaces the turn outright rather than sitting beside it — a slot showing both
// the person who swapped in and the person whose turn it would have been says nothing useful
// and reads as two people rostered.
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
