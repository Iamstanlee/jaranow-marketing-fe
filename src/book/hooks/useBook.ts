import {useCallback, useEffect, useMemo, useState} from 'react';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import type {DocumentData, Query} from 'firebase/firestore';
import {authReady, db, firebaseEnabled} from '../../lib/firebase';
import {COLLECTIONS, DUTIES} from '../constants';
import {codeFor, dateOf, money, startOfDay} from '../format';
import {slotLabel} from '../roster';
import {seedExpenses, seedLoyalty, seedRoster, seedSales, seedStaff} from '../seed';
import {totalSales} from '../totals';
import type {Expense, Loyalty, RosterEntry, Sale, Staff} from '../types';
import type {Notify} from './useToasts';

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
            offs = [
                watch<Sale>('sales', query(collection(db, COLLECTIONS.sales), orderBy('createdAt', 'desc')), setSales),
                watch<Loyalty>('loyalty', collection(db, COLLECTIONS.loyalty), setLoyalty),
                watch<Expense>('expenses', query(collection(db, COLLECTIONS.expenses), orderBy('createdAt', 'desc')), setExpenseRecords),
                // Ordered by name, which is the order the rota picker and the team list both
                // want; a rota read by eye is looked up by person, not by when they joined.
                watch<Staff>('staff', query(collection(db, COLLECTIONS.staff), orderBy('name')), setStaff),
                watch<RosterEntry>('roster', query(collection(db, COLLECTIONS.roster), orderBy('day', 'desc')), setRoster)
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
        sales, loyalty, expenseRecords, staff, roster,
        todaySales, todayExpenses, totals,
        ready, syncError,
        addSale, updateSale, removeSale,
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
