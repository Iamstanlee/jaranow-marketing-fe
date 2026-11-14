import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import type {DocumentData, Query} from 'firebase/firestore';
import {authReady, db, firebaseEnabled} from '../../lib/firebase';
import {COLLECTIONS, DUTIES, earnsPoints, type LeftReason, LIVE_WINDOW} from '../constants';
import {addDays, codeFor, dateOf, dayFrom, dayLabel, money} from '../format';
import {slotLabel, weekSpan} from '../roster';
import {type Mark, SHARE_RATE} from '../payments';
import {seedApplicants, seedAttendance, seedExpenses, seedLoyalty, seedPayouts, seedRoster, seedSales, seedStaff} from '../seed';
import {totalSales} from '../totals';
import type {Advance, Applicant, Attendance, Expense, Loyalty, Payout, RosterEntry, Sale, Staff, Timestamp} from '../types';
import type {StaffRecord} from '../components/StaffModal';
import type {Notify} from './useToasts';

type Dated = { id: string; createdAt?: Timestamp };

type Feed = 'sales' | 'loyalty' | 'expenses' | 'staff' | 'roster' | 'payouts' | 'attendance' | 'applicants';
const FEEDS: Feed[] = ['sales', 'loyalty', 'expenses', 'staff', 'roster', 'payouts', 'attendance', 'applicants'];
type Ready = Record<Feed, boolean>;

// Ledgers with a capped live window and an on-demand history behind it.
type Ledger = 'sales' | 'expenses';
const LEDGERS: Ledger[] = ['sales', 'expenses'];
type Archive = { sales: Sale[]; expenses: Expense[] };

type NewMember = { code: string; customer: string; phone: string };
type Fields<T> = Omit<T, 'id' | 'createdAt'>;

/** Every Firestore read and write the desk makes. `day` is today's midnight (useDayTick); applicants are read on admin only. */
export function useBook(day: number, toast: Notify, admin: boolean) {
    const [sales, setSales] = useState<Sale[]>(firebaseEnabled ? [] : seedSales);
    const [loyalty, setLoyalty] = useState<Loyalty[]>(firebaseEnabled ? [] : seedLoyalty);
    const [expenseRecords, setExpenseRecords] = useState<Expense[]>(firebaseEnabled ? [] : seedExpenses);
    const [staff, setStaff] = useState<Staff[]>(firebaseEnabled ? [] : seedStaff);
    const [roster, setRoster] = useState<RosterEntry[]>(firebaseEnabled ? [] : seedRoster);
    const [payouts, setPayouts] = useState<Payout[]>(firebaseEnabled ? [] : seedPayouts);
    const [attendance, setAttendance] = useState<Attendance[]>(firebaseEnabled ? [] : seedAttendance);
    const [applicants, setApplicants] = useState<Applicant[]>(firebaseEnabled ? [] : seedApplicants);
    const [syncError, setSyncError] = useState('');
    // Per feed, so an empty array before the first snapshot shows skeletons rather than ₦0.
    const [ready, setReady] = useState<Ready>(() => Object.fromEntries(FEEDS.map(f => [f, !firebaseEnabled])) as Ready);

    // A failed listener also counts as loaded, so the error banner shows instead of skeletons forever.
    const done = useCallback((key: Feed) => setReady(r => r[key] ? r : {...r, [key]: true}), []);
    const onError = useCallback((label: Feed) => (e: unknown) => {
        console.error(`Firestore ${label} sync failed`, e);
        setSyncError('Live sync was interrupted — you may be seeing older data. Check your connection.');
        done(label);
    }, [done]);

    useEffect(() => {
        if (!db) return;
        let active = true;
        let offs: Array<() => void> = [];
        authReady.then(() => {
            if (!active || !db) return;
            const watch = <T, >(feed: Feed, ref: Query<DocumentData>, apply: (rows: T[]) => void) => onSnapshot(ref, s => {
                if (feed === 'sales') setSyncError('');
                apply(s.docs.map(d => ({id: d.id, ...d.data()})) as T[]);
                done(feed);
            }, onError(feed));
            const recent = (name: string, field: string, cap: number) =>
                query(collection(db!, name), orderBy(field, 'desc'), limit(cap));
            offs = [
                watch<Sale>('sales', recent(COLLECTIONS.sales, 'createdAt', LIVE_WINDOW.sales), setSales),
                // Unbounded: codeFor numbers members by position in this list.
                watch<Loyalty>('loyalty', collection(db, COLLECTIONS.loyalty), setLoyalty),
                watch<Expense>('expenses', recent(COLLECTIONS.expenses, 'createdAt', LIVE_WINDOW.expenses), setExpenseRecords),
                watch<Staff>('staff', query(collection(db, COLLECTIONS.staff), orderBy('name')), setStaff),
                watch<RosterEntry>('roster', recent(COLLECTIONS.roster, 'day', LIVE_WINDOW.roster), setRoster),
                watch<Payout>('payouts', recent(COLLECTIONS.payouts, 'week', LIVE_WINDOW.payouts), setPayouts),
                watch<Attendance>('attendance', recent(COLLECTIONS.attendance, 'day', LIVE_WINDOW.attendance), setAttendance)
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
    }, [done, onError]);

    useEffect(() => {
        if (!db || !admin) return;
        let active = true;
        let off = () => {};
        authReady.then(() => {
            if (!active || !db) return;
            off = onSnapshot(query(collection(db, COLLECTIONS.applicants), orderBy('createdAt', 'desc'), limit(LIVE_WINDOW.applicants)), s => {
                setApplicants(s.docs.map(d => ({id: d.id, ...d.data()})) as Applicant[]);
                done('applicants');
            }, onError('applicants'));
        }).catch(() => done('applicants'));
        return () => {
            active = false;
            off();
        };
    }, [admin, done, onError]);

    // --- History ---------------------------------------------------------------------
    // `wanted` is how far back the visible section needs (0 = the whole book). The effect
    // re-checks on every snapshot, because the first request arrives before any data has
    // landed, when every window still looks complete. Each ledger is fetched only if its own
    // window falls short, and only back to `wanted`.
    const [archive, setArchive] = useState<Archive>({sales: [], expenses: []});
    const [archivedFrom, setArchivedFrom] = useState<Record<Ledger, number | null>>({sales: null, expenses: null});
    const [wanted, setWanted] = useState<number | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const fetching = useRef(false);

    const requestHistory = useCallback((from: number) => setWanted(from), []);

    useEffect(() => {
        if (!db || wanted === null || fetching.current) return;
        const live: Record<Ledger, Dated[]> = {sales, expenses: expenseRecords};
        const due = LEDGERS.filter(ledger => {
            const rows = live[ledger];
            // A window shorter than its cap is the whole collection.
            if (rows.length < LIVE_WINDOW[ledger]) return false;
            if (wanted >= dateOf(rows[rows.length - 1]).getTime()) return false;
            const had = archivedFrom[ledger];
            return had === null || wanted < had;
        });
        if (!due.length) return;

        fetching.current = true;
        setHistoryLoading(true);
        const from = wanted;
        // Filtered and ordered on one field, so no composite index is needed.
        const older = (ledger: Ledger) => {
            const base = collection(db!, COLLECTIONS[ledger]);
            return getDocs(from
                ? query(base, orderBy('createdAt', 'desc'), where('createdAt', '>=', new Date(from)))
                : query(base, orderBy('createdAt', 'desc')))
                .then(snap => [ledger, snap.docs.map(d => ({id: d.id, ...d.data()}))] as const);
        };
        Promise.all(due.map(older))
            .then(results => {
                setArchive(a => ({...a, ...Object.fromEntries(results)}));
                setArchivedFrom(f => ({...f, ...Object.fromEntries(due.map(l => [l, from]))}));
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

    const allSales = useMemo(() => mergeById(sales, archive.sales), [sales, archive.sales]);
    const allExpenses = useMemo(() => mergeById(expenseRecords, archive.expenses), [expenseRecords, archive.expenses]);

    const tomorrow = useMemo(() => addDays(new Date(day), 1).getTime(), [day]);
    const isToday = useCallback((record: Dated) => {
        const at = dateOf(record).getTime();
        return at >= day && at < tomorrow;
    }, [day, tomorrow]);
    const todaySales = useMemo(() => sales.filter(isToday), [sales, isToday]);
    const todayExpenses = useMemo(() => expenseRecords.filter(isToday), [expenseRecords, isToday]);
    const totals = useMemo(() => totalSales(todaySales), [todaySales]);

    // --- Sales -------------------------------------------------------------------------
    // The sale, the new card and the point move commit as one batch: one round trip, and no
    // sale without its point. Points move as increments so two tablets cannot lose one.
    const addSale = useCallback(async (record: Fields<Sale>, member?: Loyalty, newMember?: NewMember) => {
        const loyal = earnsPoints(record.service);
        if (!loyal) record = {...record, redeemed: false};
        const delta = record.redeemed ? {points: -5, redeemed: 1} : {points: 1, redeemed: 0};
        const joining = loyal && newMember ? {...newMember, points: delta.points, redeemed: delta.redeemed} : null;
        const existing = loyal && !joining ? member : undefined;
        const holder = joining ?? existing;
        const sale = {...record, customer: holder?.customer || 'Walk-in', loyaltyCode: holder ? record.loyaltyCode : '—'};
        if (db) {
            const batch = writeBatch(db);
            if (joining) batch.set(doc(collection(db, COLLECTIONS.loyalty)), joining);
            else if (existing) batch.update(doc(db, COLLECTIONS.loyalty, existing.id), {
                points: increment(delta.points),
                redeemed: increment(delta.redeemed)
            });
            batch.set(doc(collection(db, COLLECTIONS.sales)), {...sale, createdAt: serverTimestamp()});
            await batch.commit();
        } else {
            setSales(list => [{id: crypto.randomUUID(), ...sale}, ...list]);
            if (joining) setLoyalty(list => [...list, {id: crypto.randomUUID(), ...joining}]);
            else if (existing) setLoyalty(list => list.map(x => x.id === existing.id ? {
                ...x, points: x.points + delta.points, redeemed: x.redeemed + delta.redeemed
            } : x));
        }
        const code = holder ? sale.loyaltyCode : '';
        toast(record.redeemed ? `Free wash redeemed for ${code} — 5 points spent.`
            : `${record.service} recorded · ${money(record.amount)}${joining ? ` · new card ${code} · 1 point` : code ? ` · ${code} +1 point` : ''}`);
    }, [toast]);

    // Code and redemption are fixed once written; correcting those means delete and re-record.
    const updateSale = useCallback(async (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.sales, id), patch);
        else setSales(list => list.map(s => s.id === id ? {...s, ...patch} : s));
        toast(`Sale updated · ${patch.service} · ${money(patch.amount)}`, 'info');
    }, [toast]);

    // Gives back exactly what the sale moved. increment() cannot clamp, so a balance can go
    // negative; the Loyalty cards floor it at 0 for display.
    const removeSale = useCallback(async (sale: Sale) => {
        const member = loyalty.find((x, i) => codeFor(x, i) === sale.loyaltyCode);
        const delta = sale.redeemed ? {points: 5, redeemed: -1} : {points: -1, redeemed: 0};
        if (db) {
            const batch = writeBatch(db);
            batch.delete(doc(db, COLLECTIONS.sales, sale.id));
            if (member) batch.update(doc(db, COLLECTIONS.loyalty, member.id), {
                points: increment(delta.points),
                redeemed: increment(delta.redeemed)
            });
            await batch.commit();
        } else {
            setSales(list => list.filter(s => s.id !== sale.id));
            if (member) setLoyalty(list => list.map(x => x.id === member.id ? {
                ...x, points: x.points + delta.points, redeemed: x.redeemed + delta.redeemed
            } : x));
        }
        toast(`Sale deleted · ${money(sale.amount)}${member ? ` · ${sale.loyaltyCode} ${sale.redeemed ? '+5 points back' : '−1 point'}` : ''}`, 'warning');
    }, [loyalty, toast]);

    // Manual correction, backed by no sale (admin only). Applied against the balance on screen,
    // which is floored at 0, so +1 from a stored −1 lands on 1 rather than looking like a no-op.
    const adjustPoints = useCallback(async (id: string, delta: number) => {
        const index = loyalty.findIndex(x => x.id === id);
        const member = loyalty[index];
        if (!member) return;
        const shown = Math.max(0, member.points);
        const next = Math.max(0, shown + delta);
        if (next === shown) return;
        const moved = next - shown;
        if (db) await updateDoc(doc(db, COLLECTIONS.loyalty, member.id), {points: increment(next - member.points)});
        else setLoyalty(list => list.map(x => x.id === member.id ? {...x, points: next} : x));
        toast(`${codeFor(member, index)} · ${moved > 0 ? '+' : '−'}${Math.abs(moved)} point · now ${next}/5.`, 'info');
    }, [loyalty, toast]);

    // --- Expenses ----------------------------------------------------------------------
    const addExpense = useCallback(async (record: Fields<Expense>) => {
        if (db) await setDoc(doc(collection(db, COLLECTIONS.expenses)), {...record, createdAt: serverTimestamp()});
        else setExpenseRecords(list => [{id: crypto.randomUUID(), ...record}, ...list]);
        toast(`${record.category} expense recorded · ${money(record.amount)}`);
    }, [toast]);

    const updateExpense = useCallback(async (id: string, record: Fields<Expense>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.expenses, id), record);
        else setExpenseRecords(list => list.map(x => x.id === id ? {...x, ...record} : x));
        toast(`Expense updated · ${money(record.amount)}`, 'info');
    }, [toast]);

    const removeExpense = useCallback(async (record: Expense) => {
        if (db) await deleteDoc(doc(db, COLLECTIONS.expenses, record.id));
        else setExpenseRecords(list => list.filter(x => x.id !== record.id));
        toast(`Expense deleted · ${money(record.amount)}`, 'warning');
    }, [toast]);

    // --- Team and rota -----------------------------------------------------------------
    // `exempt` is always written (Firestore rejects undefined); a null pay field is omitted on
    // create and deleted on update.
    const addStaff = useCallback(async ({attendantPay, salary, ...record}: StaffRecord) => {
        const person = {
            ...record, exempt: record.exempt ?? [], active: true,
            ...(attendantPay ? {attendantPay} : {}), ...(salary ? {salary} : {})
        };
        if (db) await setDoc(doc(collection(db, COLLECTIONS.staff)), {...person, createdAt: serverTimestamp()});
        else setStaff(list => [...list, {id: crypto.randomUUID(), ...person}].sort((a, b) => a.name.localeCompare(b.name)));
        const out = person.exempt.length === DUTIES.length ? 'every rotation' : person.exempt[0] && `the ${person.exempt[0].toLowerCase()} rotation`;
        toast(`${record.name} added to the team${out ? ` · exempt from ${out}` : ''}.`);
    }, [toast]);

    const updateStaff = useCallback(async (id: string, patch: Partial<StaffRecord>) => {
        const {attendantPay, salary, ...rest} = patch;
        const role = 'attendantPay' in patch, paid = 'salary' in patch;
        if (db) await updateDoc(doc(db, COLLECTIONS.staff, id), {
            ...rest,
            ...(role ? {attendantPay: attendantPay ?? deleteField()} : {}),
            ...(paid ? {salary: salary ?? deleteField()} : {})
        }); else setStaff(list => list.map(p => p.id === id ? {
            ...p, ...rest,
            ...(role ? {attendantPay: attendantPay ?? undefined} : {}),
            ...(paid ? {salary: salary ?? undefined} : {})
        } : p).sort((a, b) => a.name.localeCompare(b.name)));
        const person = staff.find(p => p.id === id);
        const name = rest.name ?? person?.name ?? 'Team member';
        if (role && person && (attendantPay ?? undefined) !== person.attendantPay) toast(`${name} · ${attendantPay === 'share' ? 'revenue share' : attendantPay === 'salary' ? 'car washer on salary' : 'cashier'}.`, 'info');
        else toast(`${name} updated.`, 'info');
    }, [staff, toast]);

    const archiveStaff = useCallback(async (person: Staff, leftAt: string, leftReason: LeftReason) => {
        const patch = {active: false, leftAt, leftReason};
        if (db) await updateDoc(doc(db, COLLECTIONS.staff, person.id), patch);
        else setStaff(list => list.map(p => p.id === person.id ? {...p, ...patch} : p));
        toast(`${person.name} archived — kept on past rotas.`, 'info');
    }, [toast]);

    const restoreStaff = useCallback(async (person: Staff) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.staff, person.id), {active: true, leftAt: deleteField(), leftReason: deleteField()});
        else setStaff(list => list.map(p => p.id === person.id ? {...p, active: true, leftAt: undefined, leftReason: undefined} : p));
        toast(`${person.name} restored to the rota.`);
    }, [toast]);

    // Takes their rota swaps with them, in one batch.
    const removeStaff = useCallback(async (person: Staff) => {
        const assigned = roster.filter(r => r.staffId === person.id);
        if (db) {
            const batch = writeBatch(db);
            batch.delete(doc(db, COLLECTIONS.staff, person.id));
            assigned.forEach(r => batch.delete(doc(db!, COLLECTIONS.roster, r.id)));
            await batch.commit();
        } else {
            setStaff(list => list.filter(p => p.id !== person.id));
            setRoster(list => list.filter(r => r.staffId !== person.id));
        }
        toast(`${person.name} removed${assigned.length ? ` · ${assigned.length} swap${assigned.length === 1 ? '' : 's'} cleared` : ''}.`, 'warning');
    }, [roster, toast]);

    const updateDuty = useCallback(async (id: string, record: Fields<RosterEntry>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.roster, id), record);
        else setRoster(list => list.map(r => r.id === id ? {...r, ...record} : r));
        toast(dutyLine(record), 'info');
    }, [toast]);

    // One entry per person per slot: a repeat overwrites rather than stacking.
    const assignDuty = useCallback(async (record: Fields<RosterEntry>) => {
        const clash = roster.find(r => r.day === record.day && r.duty === record.duty && r.staffId === record.staffId);
        if (clash) return updateDuty(clash.id, record);
        if (db) await setDoc(doc(collection(db, COLLECTIONS.roster)), {...record, createdAt: serverTimestamp()});
        else setRoster(list => [{id: crypto.randomUUID(), ...record}, ...list]);
        toast(dutyLine(record));
    }, [roster, updateDuty, toast]);

    const removeDuty = useCallback(async (entry: RosterEntry) => {
        if (db) await deleteDoc(doc(db, COLLECTIONS.roster, entry.id));
        else setRoster(list => list.filter(r => r.id !== entry.id));
        toast(`Swap undone · ${slotLabel(entry.duty, entry.day)} is back to taking turns.`, 'warning');
    }, [toast]);

    // --- Pay ---------------------------------------------------------------------------
    // arrayUnion/arrayRemove so two tablets cannot overwrite each other's advances.
    const addAdvance = useCallback(async (person: Staff, entry: Omit<Advance, 'id'>) => {
        const advance: Advance = {id: crypto.randomUUID(), ...entry};
        if (db) await updateDoc(doc(db, COLLECTIONS.staff, person.id), {advances: arrayUnion(advance)});
        else setStaff(list => list.map(p => p.id === person.id ? {...p, advances: [...(p.advances || []), advance]} : p));
        toast(`${money(advance.amount)} advance recorded for ${person.name}.`);
    }, [toast]);

    const removeAdvance = useCallback(async (person: Staff, advance: Advance) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.staff, person.id), {advances: arrayRemove(advance)});
        else setStaff(list => list.map(p => p.id === person.id ? {...p, advances: (p.advances || []).filter(a => a.id !== advance.id)} : p));
        toast(`${money(advance.amount)} advance removed from ${person.name}.`, 'warning');
    }, [toast]);

    // The payout and its Staff expense (dated today, so end-of-day counts it) commit together.
    // A week already paid is ignored, so a double tap cannot pay twice.
    const markPaid = useCallback(async (record: Omit<Payout, 'id' | 'createdAt' | 'rate' | 'expenseId'>) => {
        if (payouts.some(p => p.week === record.week && p.staffId === record.staffId)) return;
        const expense = {
            category: 'Staff',
            note: `Revenue share · ${record.staffName} · week of ${weekSpan(dayFrom(record.week))}`,
            payment: record.payment,
            amount: record.amount
        };
        if (db) {
            const expenseRef = doc(collection(db, COLLECTIONS.expenses));
            const batch = writeBatch(db);
            batch.set(expenseRef, {...expense, createdAt: serverTimestamp()});
            batch.set(doc(collection(db, COLLECTIONS.payouts)), {
                ...record, rate: SHARE_RATE, expenseId: expenseRef.id, createdAt: serverTimestamp()
            });
            await batch.commit();
        } else {
            const expenseId = crypto.randomUUID();
            setExpenseRecords(list => [{id: expenseId, ...expense}, ...list]);
            setPayouts(list => [{id: crypto.randomUUID(), ...record, rate: SHARE_RATE, expenseId}, ...list]);
        }
        toast(`${record.staffName} paid · ${money(record.amount)} · added to Staff expenses.`);
    }, [payouts, toast]);

    const undoPayout = useCallback(async (payout: Payout) => {
        if (db) {
            const batch = writeBatch(db);
            batch.delete(doc(db, COLLECTIONS.payouts, payout.id));
            if (payout.expenseId) batch.delete(doc(db, COLLECTIONS.expenses, payout.expenseId));
            await batch.commit();
        } else {
            setPayouts(list => list.filter(p => p.id !== payout.id));
            if (payout.expenseId) setExpenseRecords(list => list.filter(x => x.id !== payout.expenseId));
        }
        toast(`Payment to ${payout.staffName} undone · ${money(payout.amount)} owed again.`, 'warning');
    }, [toast]);

    // --- Hiring ------------------------------------------------------------------------
    const updateApplicant = useCallback(async (applicant: Applicant, patch: Partial<Pick<Applicant, 'stage' | 'trainingFrom' | 'notes'>>) => {
        if (db) await updateDoc(doc(db, COLLECTIONS.applicants, applicant.id), patch);
        else setApplicants(list => list.map(a => a.id === applicant.id ? {...a, ...patch} : a));
        const name = applicant.name;
        toast(patch.trainingFrom ? `${name} booked for training · ${dayLabel(dayFrom(patch.trainingFrom))} and the day after.`
            : patch.stage === 'bench' ? `${name} moved to the bench.`
                : patch.stage === 'declined' ? `${name} declined.`
                    : patch.stage === 'new' ? `${name} moved back to new.`
                        : `Notes saved for ${name}.`, 'info');
    }, [toast]);

    // The team member and the hired applicant commit together, so a hire cannot be half-recorded.
    const hireApplicant = useCallback(async (applicant: Applicant, salary: number | null) => {
        const person = {
            name: applicant.name, phone: applicant.phone, exempt: [], active: true, attendantPay: 'salary' as const,
            ...(salary ? {salary} : {}), applicantId: applicant.id
        };
        if (db) {
            const staffRef = doc(collection(db, COLLECTIONS.staff));
            const batch = writeBatch(db);
            batch.set(staffRef, {...person, createdAt: serverTimestamp()});
            batch.update(doc(db, COLLECTIONS.applicants, applicant.id), {stage: 'hired', staffId: staffRef.id});
            await batch.commit();
        } else {
            const staffId = crypto.randomUUID();
            setStaff(list => [...list, {id: staffId, ...person}].sort((a, b) => a.name.localeCompare(b.name)));
            setApplicants(list => list.map(a => a.id === applicant.id ? {...a, stage: 'hired', staffId} : a));
        }
        toast(`${applicant.name} hired and added to the team${salary ? ` · ${money(salary)}/month` : ''}.`);
    }, [toast]);

    const removeApplicant = useCallback(async (applicant: Applicant) => {
        if (db) await deleteDoc(doc(db, COLLECTIONS.applicants, applicant.id));
        else setApplicants(list => list.filter(a => a.id !== applicant.id));
        toast(`${applicant.name}'s application deleted.`, 'warning');
    }, [toast]);

    // Puts the person on one list and off the other two; null takes them off all three.
    const setMark = useCallback(async (iso: string, person: Staff, mark: Mark | null) => {
        const field = {present: 'present', absent: 'absent', leave: 'paidOff'} as const;
        const lists = ['present', 'absent', 'paidOff'] as const;
        if (db) await setDoc(doc(db, COLLECTIONS.attendance, iso), {
            day: iso,
            ...Object.fromEntries(lists.map(l => [l, mark && l === field[mark] ? arrayUnion(person.id) : arrayRemove(person.id)])),
            updatedAt: serverTimestamp()
        }, {merge: true});
        else setAttendance(list => {
            const sheet = list.find(x => x.day === iso) || {id: iso, day: iso, present: []};
            const next = {...sheet, ...Object.fromEntries(lists.map(l => [l, [...(sheet[l] || []).filter(id => id !== person.id), ...(mark && l === field[mark] ? [person.id] : [])]]))} as Attendance;
            return [next, ...list.filter(x => x.day !== iso)];
        });
        toast(`${person.name} ${!mark ? 'unmarked' : mark === 'leave' ? 'on paid leave' : mark} · ${dayLabel(dayFrom(iso))}.`, mark === 'present' ? 'success' : 'info');
    }, [toast]);

    return {
        // Live window merged with any fetched history. Today's figures come from the live window only.
        sales: allSales, loyalty, expenseRecords: allExpenses, staff, roster, payouts, attendance, applicants,
        todaySales, todayExpenses, totals,
        ready, syncError,
        requestHistory, historyLoading,
        addSale, updateSale, removeSale,
        adjustPoints,
        addExpense, updateExpense, removeExpense,
        addStaff, updateStaff, archiveStaff, restoreStaff, removeStaff,
        updateApplicant, hireApplicant, removeApplicant,
        assignDuty, updateDuty, removeDuty,
        addAdvance, removeAdvance, markPaid, undoPayout, setMark
    };
}

const dutyLine = (record: Fields<RosterEntry>) =>
    `${record.staffName} · ${record.duty === 'Off' ? 'off' : 'on cleaning'} · ${slotLabel(record.duty, record.day)}.`;

// Newest first, one row per id; the live copy wins where a history fetch overlaps it.
function mergeById<T extends Dated>(live: T[], older: T[]): T[] {
    if (!older.length) return live;
    const seen = new Set(live.map(row => row.id));
    const merged = [...live, ...older.filter(row => !seen.has(row.id))];
    return merged.sort((a, b) => dateOf(b).getTime() - dateOf(a).getTime());
}
