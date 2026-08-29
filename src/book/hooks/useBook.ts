import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import type {DocumentData, Query} from 'firebase/firestore';
import {authReady, db, firebaseEnabled} from '../../lib/firebase';
import {COLLECTIONS, DUTIES, LIVE_WINDOW} from '../constants';
import {codeFor, dateOf, money, startOfDay} from '../format';
import {slotLabel} from '../roster';
import {seedExpenses, seedLoyalty, seedRoster, seedSales, seedStaff} from '../seed';
import {totalSales} from '../totals';
import type {Expense, Loyalty, RosterEntry, Sale, Staff, Timestamp} from '../types';
import type {Notify} from './useToasts';

// What both ledgers have in common, and all the merge and window helpers below need of them.
type Dated = { createdAt?: Timestamp };

type Feed = 'sales' | 'loyalty' | 'expenses' | 'staff' | 'roster';
const FEEDS: Feed[] = ['sales', 'loyalty', 'expenses', 'staff', 'roster'];
type Ready = Record<Feed, boolean>;

// Every collection the desk reads and every write it makes, in one place. The page below is
// then only layout: which section is showing, which modal is open, and who is looking.
//
// `day` is the current calendar day as a timestamp (see useDayTick) so the today-scoped
// figures roll over at midnight on a tablet that is never reloaded.
export function useBook(day: number, toast: Notify) {
    const [sales, setSales] = useState<Sale[]>(firebaseEnabled ? [] : seedSales);
    const [loyalty, setLoyalty] = useState<Loyalty[]>(firebaseEnabled ? [] : seedLoyalty);
    const [expenseRecords, setExpenseRecords] = useState<Expense[]>(firebaseEnabled ? [] : seedExpenses);
    const [staff, setStaff] = useState<Staff[]>(firebaseEnabled ? [] : seedStaff);
    const [roster, setRoster] = useState<RosterEntry[]>(firebaseEnabled ? [] : seedRoster);
    const [syncError, setSyncError] = useState('');
    // Until the first snapshot lands every collection is an empty array, which renders as a
    // business that took nothing today rather than as one still loading — and on a forecourt
    // tablet on mobile data that window is seconds long, exactly when someone is checking a
    // figure. Tracked per collection because each has its own listener; a section waits only
    // on what it actually reads. Demo mode has its seed data up front and never waits.
    const [ready, setReady] = useState<Ready>(() => Object.fromEntries(FEEDS.map(f => [f, !firebaseEnabled])) as Ready);

    useEffect(() => {
        if (!db) return;
        // Surface sync failures instead of silently wiping the tables — a transient network
        // drop should not look like an empty business. A successful sales snapshot clears it.
        // A collection stops loading when its first snapshot lands *or* when its listener
        // fails: a permission error that left the skeletons up forever would read as a desk
        // that had hung, and hide the banner explaining what actually went wrong.
        const done = (key: Feed) => setReady(r => r[key] ? r : {...r, [key]: true});
        const onError = (label: Feed) => (e: unknown) => {
            console.error(`Firestore ${label} sync failed`, e);
            setSyncError('Live sync was interrupted — you may be seeing older data. Check your connection.');
            done(label);
        };
        let active = true;
        let offs: Array<() => void> = [];
        // Attach listeners only once the anonymous session exists — the security rules
        // require request.auth, and a listener that fires before auth would be torn down
        // by a permission-denied error and never retry.
        authReady.then(() => {
            if (!active || !db) return;
            const watch = <T, >(feed: Feed, ref: Query<DocumentData>, apply: (rows: T[]) => void) => onSnapshot(ref, s => {
                if (feed === 'sales') setSyncError('');
                apply(s.docs.map(d => ({id: d.id, ...d.data()})) as T[]);
                done(feed);
            }, onError(feed));
            // Each feed that grows without bound is capped at its LIVE_WINDOW — the desk has to
            // paint before it can be useful, and re-reading every wash ever recorded to show
            // today's takings is most of why it did not. Older records are fetched once, on
            // demand, by loadHistory below.
            offs = [
                watch<Sale>('sales', query(collection(db, COLLECTIONS.sales), orderBy('createdAt', 'desc'), limit(LIVE_WINDOW.sales)), setSales),
                // Unbounded on purpose: codeFor numbers members by their position in this
                // list, so a truncated one issues codes that belong to somebody else.
                watch<Loyalty>('loyalty', collection(db, COLLECTIONS.loyalty), setLoyalty),
                watch<Expense>('expenses', query(collection(db, COLLECTIONS.expenses), orderBy('createdAt', 'desc'), limit(LIVE_WINDOW.expenses)), setExpenseRecords),
                // Ordered by name, which is the order the rota picker and the team list both
                // want; a rota read by eye is looked up by person, not by when they joined.
                watch<Staff>('staff', query(collection(db, COLLECTIONS.staff), orderBy('name')), setStaff),
                // The rota is one entry per person per slot, so its window is years deep. It
                // has no history path because nothing in the app navigates that far back.
                watch<RosterEntry>('roster', query(collection(db, COLLECTIONS.roster), orderBy('day', 'desc'), limit(LIVE_WINDOW.roster)), setRoster)
            ];
        }).catch(e => {
            console.error('Firebase authentication failed', e);
            setSyncError('Could not sign in to the database. Ensure Anonymous sign-in is enabled in Firebase Authentication.');
            setReady(Object.fromEntries(FEEDS.map(f => [f, true])) as Ready);
        });
        return () => {
            active = false;
            offs.forEach(off => off());
        };
    }, []);

    // --- History -----------------------------------------------------------------------
    // Records older than the live window, fetched when a section is actually filtered to a
    // period that reaches back past it.
    //
    // `wanted` is how far back the section on screen needs to see (0 = the beginning of the
    // book); `archivedFrom` is how far back the archive in hand already goes, null until
    // anything has been fetched. Keeping the two apart is what makes this driven by the data
    // rather than by the moment a section happened to ask: the first ask arrives before any
    // snapshot has landed, when every feed still looks complete because it is still empty, and
    // a one-shot request made then would decide no history was needed and never revisit it.
    // The effect below re-checks on every snapshot instead.
    const [archive, setArchive] = useState<{ sales: Sale[]; expenses: Expense[] }>({sales: [], expenses: []});
    const [archivedFrom, setArchivedFrom] = useState<number | null>(null);
    const [wanted, setWanted] = useState<number | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    // One fetch at a time. If the filter widens while one is in flight this skips, and the
    // effect re-runs when it settles — so the wider ask is picked up rather than raced.
    const fetching = useRef(false);

    // Sections call this from an effect, so it has to keep a stable identity. It only records
    // what is needed; deciding whether that means a fetch is the effect's job.
    const requestHistory = useCallback((from: number) => setWanted(from), []);

    useEffect(() => {
        if (!db || wanted === null || fetching.current) return;
        // How far back a feed's live window reaches. A window that came back short of its
        // limit is the entire collection, so it reaches the beginning of time — -Infinity
        // rather than 0, because 0 is a real instant (the epoch) that a comparison against a
        // requested `from` would get wrong. On a young book both feeds are in this state and
        // none of this ever runs.
        const reachOf = (rows: Dated[], cap: number) =>
            rows.length < cap ? -Infinity : dateOf(rows[rows.length - 1]).getTime();
        // The shallower of the two windows decides: history is needed if EITHER ledger fails
        // to reach back as far as the range does. Taking the deeper one would let a short
        // expense window mask a capped sales window and quietly under-report the period.
        const reach = Math.max(reachOf(sales, LIVE_WINDOW.sales), reachOf(expenseRecords, LIVE_WINDOW.expenses));
        if (wanted >= reach) return;
        if (archivedFrom !== null && wanted >= archivedFrom) return;

        fetching.current = true;
        setHistoryLoading(true);
        const from = wanted;
        // Bounded by the range where there is one, so widening the filter a step does not cost
        // the whole ledger. Ordered and filtered on the same field, so no composite index.
        const older = <T, >(name: string) => {
            const base = collection(db!, name);
            return getDocs(from
                ? query(base, orderBy('createdAt', 'desc'), where('createdAt', '>=', new Date(from)))
                : query(base, orderBy('createdAt', 'desc')))
                .then(snap => snap.docs.map(d => ({id: d.id, ...d.data()})) as T[]);
        };
        Promise.all([older<Sale>(COLLECTIONS.sales), older<Expense>(COLLECTIONS.expenses)])
            .then(([olderSales, olderExpenses]) => {
                setArchive({sales: olderSales, expenses: olderExpenses});
                setArchivedFrom(from);
            })
            .catch(e => {
                console.error('Firestore history fetch failed', e);
                setSyncError('Could not load the older records for this period — the figures below cover the recent ones only.');
            })
            .finally(() => {
                fetching.current = false;
                setHistoryLoading(false);
            });
    }, [wanted, archivedFrom, sales, expenseRecords]);

    // The live window plus whatever history has been pulled in, deduplicated by id — the two
    // overlap, because a range-bounded history fetch returns recent records as well. Sorted
    // newest first, the order every list and every report below expects.
    const allSales = useMemo(() => mergeById(sales, archive.sales), [sales, archive.sales]);
    const allExpenses = useMemo(() => mergeById(expenseRecords, archive.expenses), [expenseRecords, archive.expenses]);

    // Overview and end-of-day are both "today" views — the stat cards say so — so they read
    // today's records only. Reports is the section for looking across days.
    const todaySales = useMemo(() => sales.filter(s => startOfDay(dateOf(s)).getTime() === day), [sales, day]);
    const todayExpenses = useMemo(() => expenseRecords.filter(x => startOfDay(dateOf(x)).getTime() === day), [expenseRecords, day]);
    const totals = useMemo(() => totalSales(todaySales), [todaySales]);

    const addSale = useCallback(async (record: Omit<Sale, 'id' | 'createdAt'>, member?: Loyalty, newMember?: {
        code: string;
        customer: string;
        phone: string
    }) => {
        let activeMember = member;
        if (newMember) {
            const loyaltyRecord = {...newMember, points: 0, redeemed: 0};
            if (db) {
                const ref = await addDoc(collection(db, COLLECTIONS.loyalty), loyaltyRecord);
                activeMember = {id: ref.id, ...loyaltyRecord};
            } else {
                activeMember = {id: crypto.randomUUID(), ...loyaltyRecord};
                setLoyalty(list => [...list, activeMember as Loyalty]);
            }
            // Separate from the sale toast: a code created by mistyping an existing one is the
            // error worth catching early, and it is only visible at the moment it happens.
            toast(`Loyalty code ${newMember.code} created.`, 'info');
        }
        if (db) await addDoc(collection(db, COLLECTIONS.sales), {
            ...record,
            customer: activeMember?.customer || 'Walk-in',
            loyaltyCode: activeMember?.code || '—',
            createdAt: serverTimestamp()
        }); else setSales(list => [{
            id: crypto.randomUUID(), ...record,
            customer: activeMember?.customer || 'Walk-in',
            loyaltyCode: activeMember?.code || '—'
        }, ...list]);
        if (activeMember) {
            // Written as a delta, not as a computed total: two attendants recording washes for
            // the same customer at once would each write back the count they last saw, and one
            // of the two points would silently disappear.
            const delta = record.redeemed ? {points: -5, redeemed: 1} : {points: 1, redeemed: 0};
            if (db) await updateDoc(doc(db, COLLECTIONS.loyalty, activeMember.id), {
                points: increment(delta.points),
                redeemed: increment(delta.redeemed)
            }); else setLoyalty(list => list.map(x => x.id === activeMember?.id ? {
                ...x,
                points: x.points + delta.points,
                redeemed: x.redeemed + delta.redeemed
            } : x));
        }
        // The points line is the half a customer is standing there waiting to hear, so it goes
        // in the confirmation rather than only into the loyalty card they cannot see.
        // From the record, not the member: a member whose stored code is blank still has the
        // positional LOY-00n the modal matched on, and that is the one on their card.
        const code = activeMember && record.loyaltyCode !== '—' ? record.loyaltyCode : '';
        toast(record.redeemed ? `Free wash redeemed${code ? ` for ${code}` : ''} — 5 points spent.` : `${record.service} recorded · ${money(record.amount)}${code ? ` · ${code} earned 1 point` : ''}`);
    }, [toast]);

    // Corrections change what was sold and for how much; they deliberately cannot move the
    // loyalty code or the redemption, because those already moved a point balance that other
    // sales have since been recorded against. Fixing one of those means deleting the sale and
    // recording it again, which reverses the balance cleanly on the way out.
    const updateSale = useCallback(async (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.sales, id), patch);
        else setSales(list => list.map(s => s.id === id ? {...s, ...patch} : s));
        toast(`Sale updated · ${patch.service} · ${money(patch.amount)}`, 'info');
    }, [toast]);

    const removeSale = useCallback(async (sale: Sale) => {
        // A deleted sale gives back exactly what it took — the point it earned, or the five it
        // spent — as a delta, for the same reason the sale wrote one: two attendants recording
        // for the same customer at once would otherwise lose one of the two corrections.
        const member = loyalty.find((x, i) => codeFor(x, i) === sale.loyaltyCode);
        const delta = sale.redeemed ? {points: 5, redeemed: -1} : {points: -1, redeemed: 0};
        if (db) {
            await deleteDoc(doc(db, COLLECTIONS.sales, sale.id));
            // Deleting a sale whose point has already been spent leaves the balance short, and
            // increment() cannot clamp server-side. The cards read the balance through
            // Math.max, so it shows as 0 rather than as a negative; the paper ledger is still
            // the authority when the two disagree.
            if (member) await updateDoc(doc(db, COLLECTIONS.loyalty, member.id), {
                points: increment(delta.points),
                redeemed: increment(delta.redeemed)
            });
        } else {
            setSales(list => list.filter(s => s.id !== sale.id));
            if (member) setLoyalty(list => list.map(x => x.id === member.id ? {
                ...x,
                points: x.points + delta.points,
                redeemed: x.redeemed + delta.redeemed
            } : x));
        }
        toast(`Sale deleted · ${money(sale.amount)}${member ? ` · ${sale.loyaltyCode} ${sale.redeemed ? 'refunded 5 points' : 'lost 1 point'}` : ''}`, 'warning');
    }, [loyalty, toast]);

    // Moving a balance by hand. Points ordinarily move as a side effect of a sale, and that
    // path is the one to trust — this is the correction for when the card and the book have
    // already parted company: a wash stamped at the pump while the tablet was flat, or a card
    // stamped twice for one wash. It writes no sale, so a point added here is deliberately not
    // backed by any takings, which is why the desk keeps it behind the admin PIN and behind a
    // dialog that says what the balance is about to become.
    //
    // Takes an id rather than a member, because the Loyalty cards render a floored copy of the
    // balance (see the section) and correcting against that copy would lose the shortfall the
    // floor is hiding.
    const adjustPoints = useCallback(async (id: string, delta: number) => {
        const index = loyalty.findIndex(x => x.id === id);
        const member = loyalty[index];
        if (!member) return;
        const code = codeFor(member, index);
        // Expressed against the balance on SCREEN, not the stored one. The two part company
        // when a deleted sale takes a balance negative (see removeSale): from a stored -1,
        // +1 lands on 0 and looks to the person pressing it like nothing happened. Adding a
        // point from there pays off the shortfall as well, which is the right answer — a
        // negative balance is an accounting artefact, and the card in the customer's hand is
        // the thing being reconciled to.
        const shown = Math.max(0, member.points);
        const next = Math.max(0, shown + delta);
        if (next === shown) return; // Already at zero and being taken down: nothing to write.
        const moved = next - shown;
        // Still written as a delta, for the same reason every other point write is one: two
        // desks correcting the same card at once would otherwise each store the total they
        // last read, and one of the two corrections would vanish.
        if (db) await updateDoc(doc(db, COLLECTIONS.loyalty, member.id), {points: increment(next - member.points)});
        else setLoyalty(list => list.map(x => x.id === member.id ? {...x, points: next} : x));
        toast(`${code} · ${Math.abs(moved)} point${Math.abs(moved) === 1 ? '' : 's'} ${moved > 0 ? 'added' : 'removed'} · now ${next} / 5.`, 'info');
    }, [loyalty, toast]);

    const addExpense = useCallback(async (record: Omit<Expense, 'id' | 'createdAt'>) => {
        if (db) await addDoc(collection(db, COLLECTIONS.expenses), {
            ...record,
            createdAt: serverTimestamp()
        }); else setExpenseRecords(list => [{id: crypto.randomUUID(), ...record}, ...list]);
        toast(`${record.category} expense recorded · ${money(record.amount)}`);
    }, [toast]);

    const updateExpense = useCallback(async (id: string, record: Omit<Expense, 'id' | 'createdAt'>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.expenses, id), record);
        else setExpenseRecords(list => list.map(x => x.id === id ? {...x, ...record} : x));
        toast(`Expense updated · ${money(record.amount)}`, 'info');
    }, [toast]);

    const removeExpense = useCallback(async (record: Expense) => {
        if (db) await deleteDoc(doc(db, COLLECTIONS.expenses, record.id));
        else setExpenseRecords(list => list.filter(x => x.id !== record.id));
        toast(`Expense deleted · ${money(record.amount)}`, 'warning');
    }, [toast]);

    // --- Roster ------------------------------------------------------------------------
    // Someone new on the rota. New people start active; archiving is what happens when they
    // leave, so that their name stays on the days they actually worked. `exempt` is always
    // written as an array, never left undefined — Firestore rejects undefined, and an absent
    // field would then be the only way an older record can say "takes every turn".
    const addStaff = useCallback(async (record: Pick<Staff, 'name' | 'phone' | 'exempt'>) => {
        const person = {...record, exempt: record.exempt ?? [], active: true};
        if (db) await addDoc(collection(db, COLLECTIONS.staff), {...person, createdAt: serverTimestamp()});
        else setStaff(list => [...list, {id: crypto.randomUUID(), ...person}].sort((a, b) => a.name.localeCompare(b.name)));
        toast(`${record.name} added to the team${person.exempt.length ? ` · exempt from ${person.exempt.length === DUTIES.length ? 'every rotation' : `the ${person.exempt[0].toLowerCase()} rotation`}` : ''}.`);
    }, [toast]);

    const updateStaff = useCallback(async (id: string, patch: Partial<Pick<Staff, 'name' | 'phone' | 'active' | 'exempt'>>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.staff, id), patch);
        else setStaff(list => list.map(p => p.id === id ? {...p, ...patch} : p).sort((a, b) => a.name.localeCompare(b.name)));
        const person = staff.find(p => p.id === id);
        // Archiving and un-archiving are the two edits worth naming; a name or phone change
        // speaks for itself in the list that is already on screen.
        if (patch.active === false) toast(`${person?.name ?? 'Team member'} archived — they stay on past rotas.`, 'info');
        else if (patch.active === true) toast(`${person?.name ?? 'Team member'} is back on the rota.`);
        else toast('Team member updated.', 'info');
    }, [staff, toast]);

    // Deleting a person takes their duties with them: a rota that still lists someone who is
    // not on the team reads as an assignment nobody will turn up for. Archiving is the usual
    // move — it keeps their name on the days they actually worked — and this is for a row
    // typed in by mistake.
    const removeStaff = useCallback(async (person: Staff) => {
        const assigned = roster.filter(r => r.staffId === person.id);
        if (db) {
            await deleteDoc(doc(db, COLLECTIONS.staff, person.id));
            await Promise.all(assigned.map(r => deleteDoc(doc(db!, COLLECTIONS.roster, r.id))));
        } else {
            setStaff(list => list.filter(p => p.id !== person.id));
            setRoster(list => list.filter(r => r.staffId !== person.id));
        }
        toast(`${person.name} removed from the team${assigned.length ? ` · ${assigned.length} rota entr${assigned.length === 1 ? 'y' : 'ies'} cleared` : ''}.`, 'warning');
    }, [roster, toast]);

    const updateDuty = useCallback(async (id: string, record: Omit<RosterEntry, 'id' | 'createdAt'>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.roster, id), record);
        else setRoster(list => list.map(r => r.id === id ? {...r, ...record} : r));
        toast(dutyLine(record), 'info');
    }, [toast]);

    // One entry per person per slot: assigning somebody who already holds that slot overwrites
    // it rather than stacking a second row, so a week cannot list the same person on cleaning
    // twice. Cleaning and Off never collide here even for the same person in the same week —
    // they anchor to different dates (Monday against Sunday), and being on cleaning for a week
    // and off on its Sunday is a normal thing for a rota to say.
    const assignDuty = useCallback(async (record: Omit<RosterEntry, 'id' | 'createdAt'>) => {
        const clash = roster.find(r => r.day === record.day && r.duty === record.duty && r.staffId === record.staffId);
        if (clash) return updateDuty(clash.id, record);
        if (db) await addDoc(collection(db, COLLECTIONS.roster), {...record, createdAt: serverTimestamp()});
        else setRoster(list => [{id: crypto.randomUUID(), ...record}, ...list]);
        toast(dutyLine(record));
    }, [roster, updateDuty, toast]);

    // Deleting the override, not the duty: the slot goes back to whoever's turn it is, so the
    // toast says that rather than reporting an empty week nobody is on.
    const removeDuty = useCallback(async (entry: RosterEntry) => {
        if (db) await deleteDoc(doc(db, COLLECTIONS.roster, entry.id));
        else setRoster(list => list.filter(r => r.id !== entry.id));
        toast(`Swap undone · ${slotLabel(entry.duty, entry.day)} is back to taking turns.`, 'warning');
    }, [toast]);

    return {
        // The merged views, so a section filtered to a wide period sees the history it pulled
        // in. Today's figures are derived from the live window above and are never affected.
        sales: allSales, loyalty, expenseRecords: allExpenses, staff, roster,
        todaySales, todayExpenses, totals,
        ready, syncError,
        requestHistory, historyLoading,
        addSale, updateSale, removeSale,
        adjustPoints,
        addExpense, updateExpense, removeExpense,
        addStaff, updateStaff, removeStaff,
        assignDuty, updateDuty, removeDuty
    };
}

// Toast wording. The two duties get different sentences because they name different things —
// "on cleaning · week of 4 – 10 Aug" against "off · Sunday 10 Aug" — and one shared phrasing
// would have to be vague enough to be right for both.
const dutyLine = (record: Omit<RosterEntry, 'id' | 'createdAt'>) =>
    `${record.staffName} · ${record.duty === 'Off' ? 'off' : 'on cleaning'} · ${slotLabel(record.duty, record.day)}.`;

// Newest first, one row per id. The live window and a history fetch overlap by design, so the
// live copy is the one kept — it is the one a pending serverTimestamp settles into.
function mergeById<T extends Dated & { id: string }>(live: T[], older: T[]): T[] {
    if (!older.length) return live;
    const seen = new Set(live.map(row => row.id));
    const merged = [...live, ...older.filter(row => !seen.has(row.id))];
    return merged.sort((a, b) => dateOf(b).getTime() - dateOf(a).getTime());
}
