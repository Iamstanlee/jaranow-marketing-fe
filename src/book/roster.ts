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

// Weeks before the epoch give a negative turn, and JS % keeps the sign.
const turnAt = (order: Staff[], turn: number) => order[((turn % order.length) + order.length) % order.length];
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;

// Whose turn a slot falls to.
//
// Cleaning is the plain cycle — one person per week, straight down the list — so with `n`
// people in it everybody has it once every `n` weeks and nobody has it twice running.
//
// Off is that cycle offset one place along, so whoever is carrying cleaning for the week is
// not also the one away on its Sunday. The offset is enough on its own while the two
// rotations are the same list of people, which they are until somebody is exempt from one.
//
// Exemptions make them two lists of different lengths, and then the offset can land on
// exactly the person the cleaning order chose. Stepping one further along the cycle looks
// like the fix and is not: it eats the following week's turn a week early, so that person
// comes round twice in a row and the person stepped over loses their turn altogether. With
// four people off and three cleaning that put one name on two Sundays running while another
// went six weeks without one.
//
// So a clash moves a turn WITHIN its own cycle instead of stepping outside it. The two cycles
// line up again every lcm(off, cleaning) weeks, so that whole period is laid out in one go and
// each run of `n` weeks in it is dealt out as a permutation of the `n` people. Which week
// somebody is off can move; how many turns they get cannot. That is what makes the guarantee
// hold by construction rather than by inspection: everybody in the rotation is off exactly
// once every `n` weeks, and never two weeks running.
//
// One full period of Sunday-off turns, indexed by week-within-period. It is laid out week by
// week, taking the plain next turn wherever that works and backing up to try the one after it
// where it does not — a search rather than an arithmetic trick, because the two cycles are
// genuinely two cycles and there is no offset that reconciles every pair of lengths. It is a
// handful of weeks over a handful of people, so it is recomputed per call; caching it would
// mean holding a snapshot of the team that the next joiner makes wrong.
const offPeriod = (staff: Staff[]): Staff[] => {
    const off = rotation(staff, 'Off'), cleaning = rotation(staff, 'Cleaning');
    const n = off.length, span = cleaning.length || 1;
    const length = n / gcd(n, span) * span;
    const cleanerOn = (p: number) => cleaning.length ? turnAt(cleaning, p) : null;
    // `clear` keeps a week's Sunday off away from its own cleaning turn, `apart` keeps anybody
    // from taking two Sundays running. Both are asked for first and given up in that order,
    // because some teams cannot have them: one person cleaning every week has to spend one of
    // their own Sundays off eventually, and a two-person rotation has to alternate whatever
    // the cleaning cycle is doing. Sharing a week with cleaning is the worse of the two — one
    // is unfair, the other is incoherent — so it is the last thing dropped.
    const lay = (apart: boolean, clear: boolean): Staff[] | null => {
        const picks: Staff[] = [];
        // A search that cannot pay for itself: the periods here are a dozen weeks or so and
        // settle in a few hundred steps, so a budget this size is only ever spent by a shape
        // with no answer, and spending it is how that shape is recognised.
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
            // Candidates in cycle order from whoever's turn it plainly is, so a team with
            // nothing to settle comes out as the turn-by-turn cycle it always was, and a week
            // that has to move moves as little as it can.
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
    // The last resort is the plain cycle: a team of one is off on the Sunday of the week they
    // clean, because there is nobody else to be either.
    return lay(true, true) || lay(false, true) || lay(true, false)
        || Array.from({length}, (_, p) => turnAt(off, p + 1));
};

// A hand-written swap is not consulted here: the rotation is derived from the team alone, so
// swapping somebody into a cleaning week can still put their name in both panels. That is a
// decision somebody made rather than a clash the rota caused.
export const dueFor = (duty: Duty, monday: Date, staff: Staff[]): Staff | null => {
    const order = rotation(staff, duty);
    if (!order.length) return null;
    const week = weekNumber(monday);
    if (duty !== 'Off') return turnAt(order, week);
    const period = offPeriod(staff);
    return period[((week % period.length) + period.length) % period.length];
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
