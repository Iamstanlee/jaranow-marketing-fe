import type {Duty} from './constants';
import {dayFrom} from './format';
import {dueFor, inRotation, rotation, weekNumber, weekRoster} from './roster';
import type {RosterEntry, Staff} from './types';

// The rotation is the one piece of the rota with no UI to check it against: it decides whose
// week it is for weeks nobody has opened yet, so a modulo that goes negative or an ordering
// that reshuffles on a new joiner is invisible until somebody turns up on the wrong Sunday.

const person = (id: string, name: string, joinedOn: string, active = true): Staff => ({
    id, name, phone: '', active,
    createdAt: {toDate: () => dayFrom(joinedOn)}
});
const exempt = (from: Staff, ...duties: Duty[]): Staff => ({...from, exempt: duties});

// Deliberately not in alphabetical order of joining: Zara joined first.
const team = [
    person('a', 'Zara Musa', '2024-01-01'),
    person('b', 'Ade Bello', '2024-02-01'),
    person('c', 'Chidi Okonkwo', '2024-03-01')
];
const monday = (iso: string) => dayFrom(iso);

describe('rotation order', () => {
    it('runs in join order, so a new name does not re-cut everybody else', () => {
        expect(rotation(team, 'Cleaning').map(p => p.name)).toEqual(['Zara Musa', 'Ade Bello', 'Chidi Okonkwo']);
        const withNewJoiner = [...team, person('d', 'Aaron Eze', '2024-09-01')];
        // Alphabetically Aaron would lead and shift all three; by join order he takes his turn last.
        expect(rotation(withNewJoiner, 'Cleaning').map(p => p.name).slice(0, 3)).toEqual(['Zara Musa', 'Ade Bello', 'Chidi Okonkwo']);
    });

    it('leaves out archived people', () => {
        const archived = [team[0], {...team[1], active: false}, team[2]];
        expect(rotation(archived, 'Cleaning').map(p => p.id)).toEqual(['a', 'c']);
    });
});

describe('exemptions', () => {
    it('drops somebody from the rotation they are exempt from and no other', () => {
        const mixed = [team[0], exempt(team[1], 'Cleaning'), team[2]];
        expect(rotation(mixed, 'Cleaning').map(p => p.id)).toEqual(['a', 'c']);
        expect(rotation(mixed, 'Off').map(p => p.id)).toEqual(['a', 'b', 'c']);
    });

    it('treats a missing exempt field as taking every turn', () => {
        // Every staff record written before exemptions existed has no field at all, and must
        // not read as "exempt from everything".
        expect(inRotation(team[0], 'Cleaning')).toBe(true);
        expect(inRotation(team[0], 'Off')).toBe(true);
        expect(inRotation(exempt(team[0]), 'Cleaning')).toBe(true);
    });

    it('never lets a turn fall to somebody exempt from it, over a full cycle', () => {
        const mixed = [team[0], exempt(team[1], 'Cleaning'), exempt(team[2], 'Off')];
        for (let i = 0; i < 12; i++) {
            const week = new Date(monday('2024-01-01').getTime() + i * 604_800_000);
            expect(dueFor('Cleaning', week, mixed)!.id).not.toBe('b');
            expect(dueFor('Off', week, mixed)!.id).not.toBe('c');
        }
    });

    it('keeps cleaning and off apart even when the exemptions make them different lists', () => {
        // Two lists of different lengths is exactly where offsetting inside one list stops
        // guaranteeing two different names.
        const mixed = [team[0], exempt(team[1], 'Cleaning'), team[2]];
        for (let i = 0; i < 24; i++) {
            const week = new Date(monday('2024-01-01').getTime() + i * 604_800_000);
            expect(dueFor('Off', week, mixed)!.id).not.toBe(dueFor('Cleaning', week, mixed)!.id);
        }
    });

    it('has nobody to pick when the whole team is exempt from that duty alone', () => {
        const noCleaners = team.map(p => exempt(p, 'Cleaning'));
        expect(dueFor('Cleaning', monday('2024-01-01'), noCleaners)).toBeNull();
        // The other rotation is untouched by it.
        expect(dueFor('Off', monday('2024-01-01'), noCleaners)).not.toBeNull();
    });

    it('leaves the slot to a hand-written swap when everybody is exempt', () => {
        const noCleaners = team.map(p => exempt(p, 'Cleaning'));
        const swap: RosterEntry = {
            id: 'r9', day: '2024-01-08', staffId: 'a', staffName: 'Zara Musa', duty: 'Cleaning'
        };
        expect(weekRoster([], noCleaners, monday('2024-01-08')).cleaning).toEqual([]);
        expect(weekRoster([swap], noCleaners, monday('2024-01-08')).cleaning[0].id).toBe('r9');
    });
});

describe('weekNumber', () => {
    it('counts whole weeks from the epoch Monday', () => {
        expect(weekNumber(monday('2024-01-01'))).toBe(0);
        expect(weekNumber(monday('2024-01-08'))).toBe(1);
        expect(weekNumber(monday('2025-01-06'))).toBe(53);
    });
});

describe('dueFor', () => {
    it('advances one person per week and wraps', () => {
        const weeks = ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22'];
        expect(weeks.map(w => dueFor('Cleaning', monday(w), team)!.name))
            .toEqual(['Zara Musa', 'Ade Bello', 'Chidi Okonkwo', 'Zara Musa']);
    });

    it('never puts the same person on cleaning and off in one week', () => {
        for (let i = 0; i < 12; i++) {
            const week = new Date(monday('2024-01-01').getTime() + i * 604_800_000);
            expect(dueFor('Off', week, team)!.id).not.toBe(dueFor('Cleaning', week, team)!.id);
        }
    });

    it('gives everybody one Sunday off per cycle, and never two weeks running', () => {
        // The case the old rotation got wrong. Four people take Sundays off, three of them
        // clean, so the two cycles are different lengths and the offset alone stops keeping
        // them apart. Stepping past a clash used to consume the next week's turn a week
        // early: one name took two Sundays running while another went six weeks without one.
        const team4 = [...team, person('d', 'Bimpe Ali', '2024-04-01')];
        const mixed = [team4[0], team4[1], team4[2], exempt(team4[3], 'Cleaning')];
        const offs: string[] = [];
        for (let i = 0; i < 24; i++) {
            const week = new Date(monday('2024-01-01').getTime() + i * 604_800_000);
            offs.push(dueFor('Off', week, mixed)!.id);
            expect(dueFor('Off', week, mixed)!.id).not.toBe(dueFor('Cleaning', week, mixed)!.id);
        }
        expect(offs.slice(1).filter((id, i) => id === offs[i])).toEqual([]);
        // Four in the rotation, so every four-week cycle holds all four exactly once.
        for (let start = 0; start + 4 <= offs.length; start += 4)
            expect(Array.from(new Set(offs.slice(start, start + 4)))).toHaveLength(4);
    });

    it('keeps the turns of the week either side of a cycle apart too', () => {
        // A trade at the end of one cycle can hand the same person the start of the next,
        // which is once per cycle and still two Sundays running. The period wraps for exactly
        // this reason, so the boundary is checked like any other week.
        const mixed = [team[0], exempt(team[1], 'Cleaning'), team[2]];
        let previous = '';
        for (let i = -12; i < 36; i++) {
            const week = new Date(monday('2024-01-01').getTime() + i * 604_800_000);
            const id = dueFor('Off', week, mixed)!.id;
            expect(id).not.toBe(previous);
            previous = id;
        }
    });

    it('gives a team of one both duties rather than nothing', () => {
        const solo = [team[0]];
        expect(dueFor('Cleaning', monday('2024-05-06'), solo)!.id).toBe('a');
        expect(dueFor('Off', monday('2024-05-06'), solo)!.id).toBe('a');
    });

    it('resolves weeks before the epoch instead of running off the front of the list', () => {
        // JS % keeps the sign of the dividend, so a negative week is where an unguarded
        // modulo hands back undefined and the panel renders blank.
        expect(weekNumber(monday('2023-11-06'))).toBeLessThan(0);
        expect(dueFor('Cleaning', monday('2023-11-06'), team)).not.toBeNull();
        expect(dueFor('Off', monday('2023-12-25'), team)).not.toBeNull();
    });

    it('has nobody to pick with an empty or fully archived team', () => {
        expect(dueFor('Cleaning', monday('2024-01-01'), [])).toBeNull();
        expect(dueFor('Cleaning', monday('2024-01-01'), team.map(p => ({...p, active: false})))).toBeNull();
    });
});

describe('weekRoster', () => {
    const week = monday('2024-01-08');

    it('fills both slots from the rotation when nothing is stored', () => {
        const {cleaning, off} = weekRoster([], team, week);
        expect(cleaning).toHaveLength(1);
        expect(cleaning[0].auto).toBe(true);
        expect(cleaning[0].staffName).toBe('Ade Bello');
        // Off anchors to the Sunday, not the Monday.
        expect(off[0].day).toBe('2024-01-14');
        expect(off[0].staffName).toBe('Chidi Okonkwo');
    });

    it('lets a stored swap replace the turn outright', () => {
        const swap: RosterEntry = {
            id: 'r1', day: '2024-01-08', staffId: 'c', staffName: 'Chidi Okonkwo', duty: 'Cleaning'
        };
        const {cleaning, off} = weekRoster([swap], team, week);
        expect(cleaning).toHaveLength(1);
        expect(cleaning[0].id).toBe('r1');
        expect(cleaning[0].auto).toBeUndefined();
        // Overriding one slot leaves the other still taking turns.
        expect(off[0].auto).toBe(true);
    });

    it('ignores entries belonging to another week', () => {
        const elsewhere: RosterEntry = {
            id: 'r2', day: '2024-02-05', staffId: 'a', staffName: 'Zara Musa', duty: 'Cleaning'
        };
        expect(weekRoster([elsewhere], team, week)['cleaning'][0].auto).toBe(true);
    });
});
