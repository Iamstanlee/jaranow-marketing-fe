import type {Duty} from './constants';
import {dayFrom} from './format';
import {cleanerFor, inRotation, offDays, quietestDay, rotation, sameSlot, slotOf, weekNumber, weekRoster} from './roster';
import type {RosterEntry, Staff} from './types';

// The rotation is the one piece of the rota with no UI to check it against: it decides whose
// week it is for weeks nobody has opened yet, so a modulo that goes negative or an ordering
// that reshuffles on a new joiner is invisible until somebody turns up on the wrong day.

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
            expect(cleanerFor(week, mixed)!.id).not.toBe('b');
        }
    });

    it('has nobody to pick when the whole team is exempt from that duty alone', () => {
        const noCleaners = team.map(p => exempt(p, 'Cleaning'));
        expect(cleanerFor(monday('2024-01-01'), noCleaners)).toBeNull();
        // Days off are untouched by it.
        expect(weekRoster([], noCleaners, monday('2024-03-04')).off).toHaveLength(3);
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

describe('cleanerFor', () => {
    it('advances one person per week and wraps', () => {
        const weeks = ['2024-01-01', '2024-01-08', '2024-01-15', '2024-01-22'];
        expect(weeks.map(w => cleanerFor(monday(w), team)!.name))
            .toEqual(['Zara Musa', 'Ade Bello', 'Chidi Okonkwo', 'Zara Musa']);
    });

    it('gives a team of one both duties rather than nothing', () => {
        const {cleaning, off} = weekRoster([], [team[0]], monday('2024-05-06'));
        expect([cleaning[0].staffId, off[0].staffId]).toEqual(['a', 'a']);
    });

    it('resolves weeks before the epoch instead of running off the front of the list', () => {
        // JS % keeps the sign of the dividend, so a negative week is where an unguarded
        // modulo hands back undefined and the panel renders blank.
        expect(weekNumber(monday('2023-11-06'))).toBeLessThan(0);
        expect(cleanerFor(monday('2023-11-06'), team)).not.toBeNull();
    });

    it('has nobody to pick with an empty or fully archived team', () => {
        expect(cleanerFor(monday('2024-01-01'), [])).toBeNull();
        expect(cleanerFor(monday('2024-01-01'), team.map(p => ({...p, active: false})))).toBeNull();
    });
});

describe('weekRoster', () => {
    const week = monday('2024-01-08');

    it('fills both slots from the rotation when nothing is stored', () => {
        const {cleaning, off} = weekRoster([], team, week);
        expect(cleaning).toHaveLength(1);
        expect(cleaning[0].auto).toBe(true);
        expect(cleaning[0].staffName).toBe('Ade Bello');
        // Ade and Chidi had not joined yet, so only Zara has a day off.
        expect(off.map(e => [e.staffId, e.day])).toEqual([['a', '2024-01-08']]);
        // Once all three have joined, each is off on their own day: Zara Monday, Ade Tuesday, Chidi Sunday.
        expect(weekRoster([], team, monday('2024-03-04')).off.map(e => [e.staffId, e.day]))
            .toEqual([['a', '2024-03-04'], ['b', '2024-03-05'], ['c', '2024-03-10']]);
    });

    it('lets a stored swap replace the turn outright', () => {
        const swap: RosterEntry = {
            id: 'r1', day: '2024-01-08', staffId: 'c', staffName: 'Chidi Okonkwo', duty: 'Cleaning'
        };
        const {cleaning, off} = weekRoster([swap], team, week);
        expect(cleaning).toHaveLength(1);
        expect(cleaning[0].id).toBe('r1');
        expect(cleaning[0].auto).toBeUndefined();
        // Overriding cleaning leaves days off alone.
        expect(off.every(e => e.auto)).toBe(true);
    });

    it('ignores entries belonging to another week', () => {
        const elsewhere: RosterEntry = {
            id: 'r2', day: '2024-02-05', staffId: 'a', staffName: 'Zara Musa', duty: 'Cleaning'
        };
        expect(weekRoster([elsewhere], team, week)['cleaning'][0].auto).toBe(true);
    });
});

describe('weekly days off', () => {
    const week = monday('2026-11-23');
    const days = (staff: Staff[]) => offDays(staff).map(o => o.day);

    it('gives everybody in the rotation one quiet day, spread across Monday, Tuesday and Sunday', () => {
        const team5 = [...team, person('d', 'Bimpe Ali', '2024-04-01'), person('e', 'Efe Obi', '2024-05-01')];
        expect(days(team5)).toEqual(['Monday', 'Tuesday', 'Sunday', 'Monday', 'Tuesday']);
        const {off} = weekRoster([], team5, week);
        expect(off.map(e => e.day)).toEqual(['2026-11-23', '2026-11-23', '2026-11-24', '2026-11-24', '2026-11-29']);
        expect(new Set(off.map(e => e.staffId)).size).toBe(5);
    });

    it('keeps a stored day and spreads everybody else around it', () => {
        const pinned = [{...team[0], offDay: 'Tuesday' as const}, team[1], team[2]];
        expect(days(pinned)).toEqual(['Tuesday', 'Monday', 'Sunday']);
        expect(quietestDay(pinned.slice(0, 2))).toBe('Sunday');
    });

    it('gives nobody a day off who is exempt from it', () => {
        const mixed = [team[0], exempt(team[1], 'Off'), team[2]];
        expect(weekRoster([], mixed, week).off.map(e => e.staffId)).toEqual(['a', 'c']);
    });

    it('lets a swap move one person\'s day for that week and nobody else\'s', () => {
        const moved: RosterEntry = {id: 'r1', day: '2026-11-26', staffId: 'a', staffName: 'Zara Musa', duty: 'Off'};
        const {off} = weekRoster([moved], team, week);
        expect(off.map(e => [e.staffId, e.day])).toEqual([['b', '2026-11-24'], ['a', '2026-11-26'], ['c', '2026-11-29']]);
        expect(weekRoster([moved], team, monday('2026-11-30')).off.find(e => e.staffId === 'a')!.day).toBe('2026-11-30');
    });

    it('treats one Off entry per person per week as the slot', () => {
        expect(slotOf('Off', dayFrom('2026-11-25'))).toBe('2026-11-25');
        expect(sameSlot({day: '2026-11-23', duty: 'Off', staffId: 'a'}, {day: '2026-11-26', duty: 'Off', staffId: 'a'})).toBe(true);
        expect(sameSlot({day: '2026-11-29', duty: 'Off', staffId: 'a'}, {day: '2026-11-30', duty: 'Off', staffId: 'a'})).toBe(false);
    });

    it('gives no day off before the day somebody was added', () => {
        // Bimpe joins on Wednesday 25 Nov: her Monday has passed, so her first day off is the next week's.
        const team4 = [...team, person('d', 'Bimpe Ali', '2026-11-25')];
        expect(weekRoster([], team4, week).off.map(e => e.staffId)).toEqual(['a', 'b', 'c']);
        expect(weekRoster([], team4, monday('2026-11-30')).off.map(e => e.staffId)).toContain('d');
        // Joining on the day itself still counts.
        const sameDay = [...team, person('d', 'Bimpe Ali', '2026-11-23')];
        expect(weekRoster([], sameDay, week).off.map(e => e.staffId)).toContain('d');
    });
});
