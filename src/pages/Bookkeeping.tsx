import {useCallback, useEffect, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
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
import {
    BarChart3,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardCheck, Forward,
    Gift,
    Info,
    LayoutDashboard,
    LogOut,
    Menu,
    Pencil,
    PiggyBank,
    Plus,
    ShieldCheck,
    Sparkles,
    Trash2,
    TriangleAlert,
    WalletCards,
    X
} from 'lucide-react';
import {authReady, db, firebaseEnabled} from '../lib/firebase';

type Timestamp = { toDate: () => Date };
type Sale = {
    id: string;
    loyaltyCode: string;
    customer: string;
    service: Service;
    payment: string;
    amount: number;
    redeemed?: boolean;
    createdAt?: Timestamp
};
type Loyalty = { id: string; code?: string; customer: string; phone: string; points: number; redeemed: number };
type Expense = { id: string; category: string; note: string; payment: string; amount: number; createdAt?: Timestamp };
type Role = 'admin' | 'staff';
type Section = 'overview' | 'sales' | 'loyalty' | 'expenses' | 'eod' | 'reports';
type Service = keyof typeof SERVICES;
const SERVICES = {'Exterior wash': 2000, 'Full wash': 3000, 'Deep/Vacuum wash': 4000} as const;
// Where the end-of-day summary is sent. Digits only — wa.me rejects a leading "+".
const EOD_REPORT_PHONE = '2347048667650';
const money = (value: number) => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
}).format(value);
// Called during render rather than computed once at module load: the desk is left open on a
// tablet for a whole shift, and a module-level date would still say yesterday after midnight.
const longDate = () => new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
const greeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
};
// A record still waiting on serverTimestamp has no createdAt yet, so it reads as just-now —
// which is where it was written, and it settles to the server value on the next snapshot.
const dateOf = (record: { createdAt?: Timestamp }) => record.createdAt?.toDate() || new Date();
const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};
const endOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};
const isToday = (date: Date) => startOfDay(date).getTime() === startOfDay(new Date()).getTime();
// Two washes at the same price on the same day are otherwise indistinguishable in the list,
// which is exactly the pair someone is trying to tell apart when they come to correct one.
// Explicit hour12: the desk is read at a glance, and en-NG resolves 12/24h differently
// across browsers — a list that flips format between devices reads as a different figure.
const timeLabel = (date: Date) => date.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
});
// Lists span days, so every row carries when it was logged. The two most recent days are
// named — "Today" is what a reader is actually checking for — and older rows get a date.
const dayLabel = (date: Date) => {
    const day = startOfDay(date).getTime(), edge = startOfDay(new Date());
    if (day === edge.getTime()) return 'Today';
    edge.setDate(edge.getDate() - 1);
    if (day === edge.getTime()) return 'Yesterday';
    return date.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short', ...(date.getFullYear() === new Date().getFullYear() ? {} : {year: 'numeric'})
    });
};
const codeFor = (member: Loyalty, index: number) => member.code || `LOY-${String(index + 1).padStart(3, '0')}`;
// Every list that can span days filters through the same control, so a range learned on one
// page works on the next. A range is a named preset or, for CUSTOM, a pair of yyyy-mm-dd
// days from the two date inputs; either end may be blank, meaning "unbounded on that side"
// rather than "empty range" — half a pair is what you have while you are still typing.
const CUSTOM = 'Custom range';
const PERIODS = ['All time', 'Today', 'Yesterday', 'Last 3 days', 'Last 7 days', 'This week', 'This month', 'Last month', 'Last 3 months', 'Last 6 months', '1 year', 'Last year'];
type Range = { preset: string; from: string; to: string };
const rangeOf = (preset: string): Range => ({preset, from: '', to: ''});
// Local yyyy-mm-dd. toISOString() would be UTC, so any desk east of Greenwich labels
// "today" as tomorrow for its last hour of the day — Lagos is UTC+1.
const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
// Parsed as local midnight. `new Date('2026-08-02')` is parsed as UTC, which lands on the
// previous day west of Greenwich and would silently shift every custom filter by a day.
const dayFrom = (iso: string) => new Date(`${iso}T00:00:00`);
const dateText = (iso: string) => dayFrom(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
});
// What the filter is currently showing, for section subheadings — a report captioned
// "Custom range" says nothing, and these figures get read aloud off the screen.
const rangeLabel = (range: Range) => range.preset !== CUSTOM ? range.preset
    : range.from && range.to ? `${dateText(range.from)} – ${dateText(range.to)}`
        : range.from ? `From ${dateText(range.from)}`
            : range.to ? `Up to ${dateText(range.to)}` : 'All time';
// usePage resets on this: a range change makes whatever page you were on meaningless.
const rangeKey = (range: Range) => `${range.preset}|${range.from}|${range.to}`;
// The desk is a tablet left open at the forecourt and unlocked once at the start of a shift,
// so re-entering the PIN on every reload was pushing staff towards writing it down. The
// session records which PIN was entered and when; it is not a credential — Firestore still
// does its own anonymous auth, and anyone holding the device can read the books anyway.
const SESSION_KEY = 'jaranow.book.session';
const SESSION_MS = 24 * 60 * 60 * 1000;
type Session = { role: Role; expires: number };
const readSession = (): Session | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as Session;
        // An expired session, a clock moved backwards, a hand-edited value and an older shape
        // all read as "no session" rather than as one that never ends.
        if ((session?.role !== 'admin' && session?.role !== 'staff') || !(session.expires > Date.now())) {
            clearSession();
            return null;
        }
        return session;
    } catch {
        return null;
    }
};
// Storage throws in private modes and when the quota is full; losing the session there means
// the PIN is asked for every time, which is the old behaviour rather than a broken desk.
const writeSession = (role: Role): Session => {
    const session = {role, expires: Date.now() + SESSION_MS};
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
    }
    return session;
};

function clearSession() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch {
    }
}
// A write that succeeds closes its modal, so without this the desk gives no sign anything
// happened — an attendant at a forecourt tablet re-records the sale to be sure. Failures keep
// their inline message in the modal, where the form that has to be retried still is; toasts
// are for what the closed modal can no longer say.
type Tone = 'success' | 'info' | 'warning';
type Toast = { id: string; tone: Tone; message: string };
const TONES: Record<Tone, { icon: typeof CheckCircle2; tint: string }> = {
    success: {icon: CheckCircle2, tint: 'text-emerald-600'},
    info: {icon: Info, tint: 'text-blue-600'},
    warning: {icon: TriangleAlert, tint: 'text-amber-600'}
};
const TOAST_MS = 4500;
const TOAST_LIMIT = 3;

function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    // Stable, because each card sets its own dismissal timer off it in an effect.
    const dismiss = useCallback((id: string) => setToasts(list => list.filter(t => t.id !== id)), []);
    const toast = useCallback((message: string, tone: Tone = 'success') => setToasts(list => [...list.slice(1 - TOAST_LIMIT), {
        id: crypto.randomUUID(),
        tone,
        message
    }]), []);
    return {toasts, toast, dismiss};
}

// Above the modal layer (z-50): a sale saved while a second modal is being opened should not
// slide in behind it.
function Toasts({toasts, dismiss}: { toasts: Toast[]; dismiss: (id: string) => void }) {
    return <div aria-live="polite"
                className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
        <AnimatePresence initial={false}>{toasts.map(t => <ToastCard key={t.id} toast={t} dismiss={dismiss}/>)}</AnimatePresence>
    </div>
}

function ToastCard({toast, dismiss}: { toast: Toast; dismiss: (id: string) => void }) {
    const {id, tone, message} = toast, {icon: Icon, tint} = TONES[tone];
    useEffect(() => {
        const timer = setTimeout(() => dismiss(id), TOAST_MS);
        return () => clearTimeout(timer);
    }, [id, dismiss]);
    // Tappable to dismiss — the desk is a touchscreen, and a toast covering the button you are
    // reaching for has to be clearable without waiting it out.
    // Enters and leaves upward, towards the edge it is docked against — a card that slid up
    // from below to sit at the top reads as having come from somewhere else on the screen.
    return <motion.button type="button" onClick={() => dismiss(id)} aria-label={`Dismiss: ${message}`} layout
                          initial={{opacity: 0, y: -14, scale: 0.97}} animate={{opacity: 1, y: 0, scale: 1}}
                          exit={{opacity: 0, y: -8, scale: 0.97}} transition={{duration: 0.18}}
                          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-lg">
        <span className={`mt-0.5 shrink-0 ${tint}`}><Icon size={18}/></span><span
        className="text-sm font-medium text-slate-700">{message}</span>
    </motion.button>
}

const seedSales: Sale[] = [{
    id: 's1',
    loyaltyCode: 'LOY-001',
    customer: 'Chioma Okafor',
    service: 'Full wash',
    payment: 'Transfer',
    amount: SERVICES['Full wash']
}, {
    id: 's2',
    loyaltyCode: 'LOY-002',
    customer: 'Tunde Adeyemi',
    service: 'Exterior wash',
    payment: 'POS',
    amount: SERVICES['Exterior wash']
}, {
    id: 's3',
    loyaltyCode: 'LOY-003',
    customer: 'Amina Bello',
    service: 'Deep/Vacuum wash',
    payment: 'Cash',
    amount: SERVICES['Deep/Vacuum wash']
}];
const seedLoyalty: Loyalty[] = [{
    id: 'l1',
    code: 'LOY-001',
    customer: 'Chioma Okafor',
    phone: '0803 456 7812',
    points: 4,
    redeemed: 0
}, {id: 'l2', code: 'LOY-002', customer: 'Tunde Adeyemi', phone: '0806 814 2290', points: 5, redeemed: 1}, {
    id: 'l3',
    code: 'LOY-003',
    customer: 'Amina Bello',
    phone: '0812 908 3321',
    points: 2,
    redeemed: 0
}];
const seedExpenses: Expense[] = [{
    id: 'e1',
    category: 'Supplies',
    note: 'Cleaning materials',
    payment: 'Cash',
    amount: 1200
}];

export default function Bookkeeping() {
    const [session, setSession] = useState<Session | null>(readSession), [pin, setPin] = useState(''), [pinError, setPinError] = useState('');
    const role = session?.role ?? null;
    const {toasts, toast, dismiss} = useToasts();
    const lock = () => {
        clearSession();
        setSession(null);
        setPin('');
        toast('Books locked.', 'info');
    };
    // Seed records are strictly for local demo mode. A Firebase-backed business starts empty
    // and is populated only by its Firestore collections.
    const [section, setSection] = useState<Section>('overview'), [sales, setSales] = useState<Sale[]>(firebaseEnabled ? [] : seedSales), [loyalty, setLoyalty] = useState<Loyalty[]>(firebaseEnabled ? [] : seedLoyalty), [expenseRecords, setExpenseRecords] = useState<Expense[]>(firebaseEnabled ? [] : seedExpenses);
    const [saleModal, setSaleModal] = useState(false), [expenseModal, setExpenseModal] = useState(false), [menuOpen, setMenuOpen] = useState(false), [syncError, setSyncError] = useState('');
    // Only covers arriving here by client-side navigation. What makes the app installable
    // is the manifest baked into build/__/book/index.html by scripts/prerender-meta.js —
    // by the time this effect runs the browser has already read whatever manifest the
    // document shipped with, and an install captured then carries the wrong start_url.
    useEffect(() => {
        const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        const previousManifest = manifest?.getAttribute('href');
        const previousTitle = document.title;
        if (manifest) manifest.setAttribute('href', `${process.env.PUBLIC_URL}/bookkeeping-manifest.json`);
        document.title = 'Jaranow Business Desk';
        return () => {
            if (manifest && previousManifest) manifest.setAttribute('href', previousManifest);
            document.title = previousTitle;
        };
    }, []);

    // The desk is rarely reloaded, so waiting for one to notice the session has aged out would
    // leave it unlocked for days. The timer locks it the moment 24h is up; the visibility check
    // covers a tablet that was asleep across the expiry, where the timer fires late or not at
    // all. Both re-read storage, so locking in one tab is picked up by the others on focus.
    useEffect(() => {
        if (!session) return;
        const check = () => {
            if (!readSession()) {
                setSession(null);
                setPin('');
                // Says why the PIN screen is back — otherwise an expiry looks like the desk
                // logged itself out for no reason, or like someone else locked it.
                toast('Session expired — the books were locked.', 'warning');
            }
        };
        const id = setTimeout(check, session.expires - Date.now());
        document.addEventListener('visibilitychange', check);
        return () => {
            clearTimeout(id);
            document.removeEventListener('visibilitychange', check);
        };
    }, [session, toast]);

    useEffect(() => {
        if (!db) return;
        // Surface sync failures instead of silently wiping the tables — a transient network
        // drop should not look like an empty business. A successful sales snapshot clears it.
        const onError = (label: string) => (e: unknown) => {
            console.error(`Firestore ${label} sync failed`, e);
            setSyncError('Live sync was interrupted — you may be seeing older data. Check your connection.');
        };
        let active = true;
        let offSales = () => {}, offLoyalty = () => {}, offExpenses = () => {};
        // Attach listeners only once the anonymous session exists — the security rules
        // require request.auth, and a listener that fires before auth would be torn down
        // by a permission-denied error and never retry.
        authReady.then(() => {
            if (!active || !db) return;
            offSales = onSnapshot(query(collection(db, 'car_wash_sales'), orderBy('createdAt', 'desc')), s => {
                setSyncError('');
                setSales(s.docs.map(d => ({id: d.id, ...d.data()} as Sale)));
            }, onError('sales'));
            offLoyalty = onSnapshot(collection(db, 'car_wash_loyalty'), s => setLoyalty(s.docs.map(d => ({id: d.id, ...d.data()} as Loyalty))), onError('loyalty'));
            offExpenses = onSnapshot(query(collection(db, 'car_wash_expenses'), orderBy('createdAt', 'desc')), s => setExpenseRecords(s.docs.map(d => ({id: d.id, ...d.data()} as Expense))), onError('expenses'));
        }).catch(e => {
            console.error('Firebase authentication failed', e);
            setSyncError('Could not sign in to the database. Ensure Anonymous sign-in is enabled in Firebase Authentication.');
        });
        return () => {
            active = false;
            offSales();
            offLoyalty();
            offExpenses();
        };
    }, []);
    // Overview and end-of-day are both "today" views — the stat cards say so — so they read
    // today's records only. Reports is the section for looking across days.
    const day = useDayTick();
    useDrawerSwipe(menuOpen, setMenuOpen);
    const todaySales = useMemo(() => sales.filter(s => startOfDay(dateOf(s)).getTime() === day), [sales, day]);
    const todayExpenses = useMemo(() => expenseRecords.filter(x => startOfDay(dateOf(x)).getTime() === day), [expenseRecords, day]);
    const totals = useMemo(() => totalSales(todaySales), [todaySales]);
    const login = (e: React.FormEvent) => {
        e.preventDefault();
        // Which role you were let in as decides what you can see (reports are admin-only), so
        // the unlock says it rather than leaving it to be inferred from the sidebar.
        const unlock = (as: Role) => {
            setSession(writeSession(as));
            toast(`Books unlocked — ${as} access.`);
        };
        if (pin === process.env.REACT_APP_ADMIN_PIN && pin) unlock('admin'); else if (pin === process.env.REACT_APP_STAFF_PIN && pin) unlock('staff'); else setPinError(process.env.REACT_APP_ADMIN_PIN ? 'Incorrect PIN. Please try again.' : 'Set REACT_APP_ADMIN_PIN and REACT_APP_STAFF_PIN in .env first.');
    };
    const addSale = async (record: Omit<Sale, 'id' | 'createdAt'>, member?: Loyalty, newMember?: {
        code: string;
        customer: string;
        phone: string
    }) => {
        let activeMember = member;
        if (newMember) {
            const loyaltyRecord = {...newMember, points: 0, redeemed: 0};
            if (db) {
                const ref = await addDoc(collection(db, 'car_wash_loyalty'), loyaltyRecord);
                activeMember = {id: ref.id, ...loyaltyRecord};
            } else {
                activeMember = {id: crypto.randomUUID(), ...loyaltyRecord};
                setLoyalty(list => [...list, activeMember as Loyalty]);
            }
            // Separate from the sale toast: a code created by mistyping an existing one is the
            // error worth catching early, and it is only visible at the moment it happens.
            toast(`Loyalty code ${newMember.code} created.`, 'info');
        }
        if (db) await addDoc(collection(db, 'car_wash_sales'), {
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
            if (db) await updateDoc(doc(db, 'car_wash_loyalty', activeMember.id), {
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
    };
    // Corrections change what was sold and for how much; they deliberately cannot move the
    // loyalty code or the redemption, because those already moved a point balance that other
    // sales have since been recorded against. Fixing one of those means deleting the sale and
    // recording it again, which reverses the balance cleanly on the way out.
    const updateSale = async (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => {
        if (db) await updateDoc(doc(db, 'car_wash_sales', id), patch);
        else setSales(list => list.map(s => s.id === id ? {...s, ...patch} : s));
        toast(`Sale updated · ${patch.service} · ${money(patch.amount)}`, 'info');
    };
    const removeSale = async (sale: Sale) => {
        // A deleted sale gives back exactly what it took — the point it earned, or the five it
        // spent — as a delta, for the same reason the sale wrote one: two attendants recording
        // for the same customer at once would otherwise lose one of the two corrections.
        const member = loyalty.find((x, i) => codeFor(x, i) === sale.loyaltyCode);
        const delta = sale.redeemed ? {points: 5, redeemed: -1} : {points: -1, redeemed: 0};
        if (db) {
            await deleteDoc(doc(db, 'car_wash_sales', sale.id));
            // Deleting a sale whose point has already been spent leaves the balance short, and
            // increment() cannot clamp server-side. The cards read the balance through
            // Math.max, so it shows as 0 rather than as a negative; the paper ledger is still
            // the authority when the two disagree.
            if (member) await updateDoc(doc(db, 'car_wash_loyalty', member.id), {
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
    };
    const addExpense = async (record: Omit<Expense, 'id' | 'createdAt'>) => {
        if (db) await addDoc(collection(db, 'car_wash_expenses'), {
            ...record,
            createdAt: serverTimestamp()
        }); else setExpenseRecords(list => [{id: crypto.randomUUID(), ...record}, ...list]);
        toast(`${record.category} expense recorded · ${money(record.amount)}`);
    };
    const updateExpense = async (id: string, record: Omit<Expense, 'id' | 'createdAt'>) => {
        if (db) await updateDoc(doc(db, 'car_wash_expenses', id), record);
        else setExpenseRecords(list => list.map(x => x.id === id ? {...x, ...record} : x));
        toast(`Expense updated · ${money(record.amount)}`, 'info');
    };
    const removeExpense = async (record: Expense) => {
        if (db) await deleteDoc(doc(db, 'car_wash_expenses', record.id));
        else setExpenseRecords(list => list.filter(x => x.id !== record.id));
        toast(`Expense deleted · ${money(record.amount)}`, 'warning');
    };
    if (!role) return <><PinGate pin={pin} setPin={setPin} error={pinError} login={login}/><Toasts toasts={toasts}
                                                                                                   dismiss={dismiss}/></>;
    const nav: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [{
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard
    }, {id: 'sales', label: 'Sales records', icon: Plus}, {
        id: 'loyalty',
        label: 'Loyalty',
        icon: Gift
    }, {id: 'expenses', label: 'Expenses', icon: WalletCards}, {
        id: 'eod',
        label: 'End of day',
        icon: ClipboardCheck
    }, ...(role === 'admin' ? [{id: 'reports' as const, label: 'Reports', icon: BarChart3}] : [])];
    const title = section === 'overview' ? greeting() : nav.find(x => x.id === section)?.label;
    return <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
        <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white px-5 py-6 transition-transform md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-10 flex items-center gap-3">
                <div
                    className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-xl font-black text-white">J
                </div>
                <div><p className="text-lg font-bold">jaranow</p><p className="text-xs text-slate-400">Business desk</p>
                </div>
                <button onClick={() => setMenuOpen(false)} className="ml-auto md:hidden"><X size={20}/></button>
            </div>
            <nav className="space-y-1">{nav.map(item => {
                const Icon = item.icon;
                return <button key={item.id} onClick={() => {
                    setSection(item.id);
                    setMenuOpen(false);
                }}
                               className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${section === item.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                    <Icon size={19}/>{item.label}</button>;
            })}</nav>
            <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-slate-900 p-4 text-white"><p
                className="text-sm font-semibold">Jaranow Car Wash</p><p
                className="mt-1 text-xs capitalize text-slate-400">{role} access</p>
                <button onClick={lock}
                        className="mt-4 flex items-center gap-2 text-xs text-slate-300"><LogOut size={14}/> Lock books
                </button>
            </div>
        </aside>
        {menuOpen && <button aria-label="Close menu" onClick={() => setMenuOpen(false)}
                             className="fixed inset-0 z-20 bg-slate-900/30 md:hidden"/>}
        <main className="md:ml-64">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-9">
                <div className="flex items-center gap-3">
                    <button onClick={() => setMenuOpen(true)} className="md:hidden"><Menu/></button>
                    <div><p className="text-xs text-slate-400">{longDate()}</p><h1
                        className="text-xl font-bold">{title}</h1>
                    </div>
                </div>
            </header>
            {syncError && <div role="alert"
                               className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 md:px-9">{syncError}</div>}
            {/* Deleting takings is the one action on the desk that destroys a figure rather
                than adding one, so it follows the same line reports do: admin only. Staff
                correct a wrong sale by editing it. */}
            <div className="mx-auto max-w-7xl p-5 md:p-9">{section === 'overview' &&
                <Overview totals={totals} sales={todaySales} expenses={todayExpenses}
                          onSale={() => setSaleModal(true)}
                          onChange={setSection}/>} {section === 'sales' &&
                <Sales sales={sales} onSale={() => setSaleModal(true)} onUpdate={updateSale}
                       onDelete={role === 'admin' ? removeSale : undefined}/>} {section === 'loyalty' &&
                <LoyaltySection members={loyalty}/>} {section === 'expenses' &&
                <Expenses records={expenseRecords} onAdd={() => setExpenseModal(true)} onUpdate={updateExpense}
                          onDelete={role === 'admin' ? removeExpense : undefined}/>} {section === 'eod' &&
                <Eod totals={totals} expenses={expenseRecords}/>} {section === 'reports' && role === 'admin' &&
                <Reports sales={sales} loyalty={loyalty} expenses={expenseRecords}/>}</div>
        </main>
        {saleModal && <SaleModal members={loyalty} close={() => setSaleModal(false)} save={addSale}/>} {expenseModal &&
        <ExpenseModal close={() => setExpenseModal(false)} save={addExpense}/>}<Toasts toasts={toasts}
                                                                                      dismiss={dismiss}/></div>;
}

function PinGate({pin, setPin, error, login}: {
    pin: string;
    setPin: (v: string) => void;
    error: string;
    login: (e: React.FormEvent) => void
}) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-5">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><ShieldCheck/></div>
            <h1 className="mt-6 text-2xl font-bold">Unlock the books</h1><p
            className="mt-2 text-sm leading-6 text-slate-500">Enter your Admin or Staff PIN to access Jaranow Business
            Desk.</p><input autoFocus required inputMode="numeric" type="password" value={pin}
                            onChange={e => setPin(e.target.value)} placeholder="Enter PIN"
                            className="mt-6 w-full rounded-xl border-slate-200 py-3 text-center tracking-[0.5em]"/><p
            className="mt-2 min-h-5 text-xs text-red-600">{error}</p>
            <button className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white">Unlock</button>
        </form>
    </main>
}

function SaleModal({members, close, save}: {
    members: Loyalty[];
    close: () => void;
    save: (r: Omit<Sale, 'id' | 'createdAt'>, m?: Loyalty, newMember?: {
        code: string;
        customer: string;
        phone: string
    }) => Promise<void>
}) {
    const [code, setCode] = useState(''), [service, setService] = useState<Service>('Exterior wash'), [payment, setPayment] = useState('Transfer'), [redeem, setRedeem] = useState(false), [customer, setCustomer] = useState(''), [phone, setPhone] = useState('');
    const [price, setPrice] = useState(String(SERVICES['Exterior wash']));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    // Codes are stored zero-padded to three digits (LOY-001) so a typed "1" and the
    // auto-generated "001" are the same member. Match, save and display the padded form.
    const normalizedCode = code ? `LOY-${code.replace(/\D/g, '').padStart(3, '0')}` : '';
    const member = members.find((x, i) => codeFor(x, i) === normalizedCode);
    const newCode = Boolean(normalizedCode && !member);
    const canRedeem = Boolean(member && member.points >= 5);
    // A redeemed wash is free whatever the box says, and a service change re-quotes the list
    // price — an attendant who picks the wrong service and corrects it should not be left
    // charging the old one. Anything typed after that stands, which is the point of the field.
    const amount = redeem ? 0 : Number(price) || 0;
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({
                loyaltyCode: normalizedCode || '—',
                customer: member?.customer || 'Walk-in',
                service,
                payment,
                amount,
                redeemed: redeem
            }, member, newCode ? {code: normalizedCode, customer, phone} : undefined);
            close();
        } catch (err) {
            console.error('Failed to record sale', err);
            setError('Could not save this sale. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title="Record a sale" close={close}>
        <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Loyalty code <span
            className="font-normal text-slate-400">(optional)</span>
            <div
                className="mt-1 flex items-stretch overflow-hidden rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span
                    className="grid place-items-center bg-slate-100 px-3 text-sm font-semibold text-slate-500">LOY-</span>
                <input list="loyalty-codes" inputMode="numeric" pattern="[0-9]*" value={code.replace(/\D/g, '')}
                       onChange={e => {
                           const digits = e.target.value.replace(/\D/g, '');
                           setCode(digits ? `LOY-${digits}` : '');
                           setRedeem(false);
                       }} onBlur={() => setCode(normalizedCode)} placeholder="Enter code number"
                       className="w-full rounded-none border-0 py-2 focus:ring-0"/>
            </div>
            <datalist id="loyalty-codes">{members.map((m, i) => <option key={m.id}
                                                                          value={codeFor(m, i).replace(/\D/g, '')}/>)}</datalist>
        </label>{newCode &&
            <div className="space-y-3 rounded-xl bg-blue-50 p-3"><p className="text-sm font-semibold text-blue-900">New
                loyalty customer</p><p className="text-xs text-blue-700">Name and phone
                are optional.</p><input value={customer} onChange={e => setCustomer(e.target.value)}
                                        placeholder="Customer name (optional)"
                                        className="w-full rounded-xl border-blue-100"/><input value={phone}
                                                                                              onChange={e => setPhone(e.target.value)}
                                                                                              placeholder="Phone number (optional)"
                                                                                              className="w-full rounded-xl border-blue-100"/>
            </div>}{member && <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900"><span
            className="font-semibold">{normalizedCode}</span><span
            className="float-right font-semibold">{member.points} points</span><p
            className="mt-1 text-xs text-blue-700">{canRedeem ? 'Free wash available — redeem 5 points.' : `${5 - member.points} more point(s) until a free wash.`}</p>
        </div>}<ServiceField value={service} onChange={next => {
            setService(next);
            setPrice(String(SERVICES[next]));
        }}/>{canRedeem && <label
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"><input
            type="checkbox" checked={redeem} onChange={e => setRedeem(e.target.checked)}
            className="rounded text-emerald-600"/>Redeem 5 points for this wash</label>}<PaymentField value={payment}
                                                                                                      onChange={setPayment}/><PriceField
            service={service} value={price} onChange={setPrice} free={redeem}/>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : `Save sale ${member && !redeem ? '• earn 1 point' : ''}`}</button>
        </form>
    </Modal>
}

// Shared by the record and correct forms, so a sale can only ever be corrected into a shape
// it could have been recorded in.
const SELECT = 'mt-1 w-full rounded-xl border-slate-200';

function ServiceField({value, onChange}: { value: Service; onChange: (v: Service) => void }) {
    return <label className="block text-sm font-medium">Service<select value={value}
                                                                       onChange={e => onChange(e.target.value as Service)}
                                                                       className={SELECT}>
        {(Object.keys(SERVICES) as Service[]).map(s => <option key={s}>{s}</option>)}
    </select></label>;
}

function PaymentField({value, onChange}: { value: string; onChange: (v: string) => void }) {
    return <label className="block text-sm font-medium">Payment method<select value={value}
                                                                              onChange={e => onChange(e.target.value)}
                                                                              className={SELECT}>
        <option>Transfer</option>
        <option>Cash</option>
        <option>POS</option>
    </select></label>;
}

// The list price is the default, not the rule: a saloon and an SUV are the same "Full wash"
// on the board and are not always the same money at the pump, and a returning customer gets
// something taken off. The field starts at the list price so the common case is still one
// tap, and says plainly when what is about to be saved is not it.
function PriceField({service, value, onChange, free = false}: {
    service: Service;
    value: string;
    onChange: (v: string) => void;
    free?: boolean
}) {
    const list = SERVICES[service], custom = !free && Number(value) !== list;
    return <label className="block text-sm font-medium">Amount (₦)
        <input required={!free} inputMode="numeric" disabled={free}
               value={free ? '0' : value} onChange={e => onChange(e.target.value)}
               className={`${SELECT} disabled:bg-slate-100 disabled:text-slate-400`}/>
        <span className="mt-1 flex items-center justify-between gap-3 text-xs font-normal">
            <span
                className={custom ? 'text-amber-600' : 'text-slate-400'}>{free ? 'Free wash — nothing to collect.' : custom ? `Custom price · standard is ${money(list)}` : 'Standard price'}</span>
            {custom && <button type="button" onClick={() => onChange(String(list))}
                               className="shrink-0 font-semibold text-blue-600">Reset</button>}
        </span>
    </label>;
}

// Corrects what was sold and for how much. The loyalty code and the redemption are shown but
// fixed — see updateSale for why moving them here would leave a point balance wrong.
function EditSaleModal({sale, close, save}: {
    sale: Sale;
    close: () => void;
    save: (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => Promise<void>
}) {
    const [service, setService] = useState<Service>(sale.service), [payment, setPayment] = useState(sale.payment);
    const [price, setPrice] = useState(String(sale.amount));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save(sale.id, {service, payment, amount: sale.redeemed ? 0 : Number(price) || 0});
            close();
        } catch (err) {
            console.error('Failed to update sale', err);
            setError('Could not save this correction. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title="Edit sale" close={close}>
        <form onSubmit={submit} className="space-y-4">
            <div className="rounded-xl bg-slate-100 p-3 text-sm"><span
                className="font-semibold">{sale.loyaltyCode}</span><span
                className="float-right text-slate-500">{dayLabel(dateOf(sale))} · {timeLabel(dateOf(sale))}</span><p
                className="mt-1 text-xs text-slate-500">{sale.redeemed ? 'Redeemed wash — the 5 points are already spent.' : 'The loyalty code and points cannot be changed here. Delete the sale and record it again to move them.'}</p>
            </div>
            <ServiceField value={service} onChange={next => {
                setService(next);
                setPrice(String(SERVICES[next]));
            }}/><PaymentField value={payment} onChange={setPayment}/><PriceField service={service} value={price}
                                                                                 onChange={setPrice}
                                                                                 free={sale.redeemed}/>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : 'Save changes'}</button>
        </form>
    </Modal>
}

// Deleting is not undoable and moves a loyalty balance, so it asks — and says what it is
// about to remove, because the row that was tapped is behind the dialog by the time it opens.
function ConfirmDelete({title, detail, close, confirm}: {
    title: string;
    detail: string;
    close: () => void;
    confirm: () => Promise<void>
}) {
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const go = async () => {
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await confirm();
            close();
        } catch (err) {
            console.error('Failed to delete record', err);
            setError('Could not delete this record. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={title} close={close}>
        <p className="text-sm leading-6 text-slate-500">{detail}</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
            <button type="button" onClick={close}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600">Cancel
            </button>
            <button type="button" onClick={go} disabled={submitting}
                    className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Deleting…' : 'Delete'}</button>
        </div>
    </Modal>
}

// Edit sits on the left of delete on every row, so the destructive one is never where the
// thumb lands by habit.
function RowActions({label, onEdit, onDelete}: { label: string; onEdit: () => void; onDelete?: () => void }) {
    const button = 'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400';
    return <span className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onEdit} aria-label={`Edit ${label}`}
                className={`${button} hover:text-blue-600`}><Pencil size={15}/></button>
        {onDelete && <button type="button" onClick={onDelete} aria-label={`Delete ${label}`}
                             className={`${button} hover:border-red-200 hover:text-red-600`}><Trash2 size={15}/>
        </button>}
    </span>;
}

function Overview({totals, sales, expenses, onSale, onChange}: {
    totals: ReturnType<typeof totalSales>;
    sales: Sale[];
    expenses: Expense[];
    onSale: () => void;
    onChange: (s: Section) => void
}) {
    // Today's only, like every other figure on this screen. End of day is where the cash half
    // of this is netted off the drawer; here it is just what has gone out against what came in.
    const spent = expenses.reduce((sum, x) => sum + x.amount, 0);
    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p
            className="text-sm text-slate-500">Business today.</p>
            <button onClick={onSale}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={18}/> Record sale
            </button>
        </div>
        {/* Money in, money out, and what of it is cash to be settled tonight. The transaction
            count rides on the sales card's note rather than taking a card of its own, and
            redemptions are a loyalty figure — the Loyalty and Reports sections carry them. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Stat title="Today's sales"
                                                                        value={money(totals.revenue)}
                                                                        icon={PiggyBank}
                                                                        tint="bg-blue-50 text-blue-600"
                                                                        note={`${totals.count} transactions`}/><Stat
            title="Today's expenses" value={money(spent)} icon={WalletCards} tint="bg-rose-50 text-rose-600"
            note={`${expenses.length} recorded today`}/><Stat title="Cash received" value={money(totals.cash)}
                                                              icon={BarChart3} tint="bg-amber-50 text-amber-600"
                                                              note="Ready to reconcile"/></div>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between p-5">
                <div><h2 className="font-bold">Recent sales</h2><p className="text-xs text-slate-400">Today’s records</p>
                </div>
                <button onClick={() => onChange('sales')} className="text-sm font-semibold text-blue-600">View all
                </button>
            </div>
            {/* Today only, like the figures above it. "View all" is the way to earlier days. */}
            <SalesTable sales={sales.slice(0, 5)} empty="No sales recorded today."/></section>
    </>
}

function Sales({sales, onSale, onUpdate, onDelete}: {
    sales: Sale[];
    onSale: () => void;
    onUpdate: (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => Promise<void>;
    onDelete?: (s: Sale) => Promise<void>
}) {
    // All time by default: this is the ledger, and a section that silently hid last week's
    // sales behind a default filter would read as records having gone missing.
    const [range, setRange] = useState<Range>(() => rangeOf('All time'));
    const [editing, setEditing] = useState<Sale | null>(null), [deleting, setDeleting] = useState<Sale | null>(null);
    const filtered = useMemo(() => sales.filter(s => inRange(dateOf(s), range)), [sales, range]);
    const total = filtered.reduce((sum, s) => sum + s.amount, 0);
    const {slice, ...pager} = usePage(filtered, rangeKey(range));
    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p
            className="text-sm text-slate-500">Every service and
            payment in one place.</p>
            <button onClick={onSale}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={18}/> Record sale
            </button>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white">
            <div
                className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-bold">{money(total)}</h2><p
                    className="text-xs text-slate-400">{filtered.length} sale{filtered.length === 1 ? '' : 's'} · {rangeLabel(range)}</p>
                </div>
                <PeriodFilter range={range} setRange={setRange} label="Filter sales by date"/>
            </div>
            <SalesTable sales={slice} empty="No sales in this date range." onEdit={setEditing}
                        onDelete={onDelete && setDeleting}/><Pagination {...pager}/></section>
        {editing && <EditSaleModal sale={editing} close={() => setEditing(null)} save={onUpdate}/>}
        {deleting && onDelete && <ConfirmDelete title="Delete this sale?"
                                                detail={`${deleting.service} · ${money(deleting.amount)} · ${dayLabel(dateOf(deleting))} at ${timeLabel(dateOf(deleting))}. This cannot be undone${deleting.loyaltyCode !== '—' ? `, and ${deleting.loyaltyCode} ${deleting.redeemed ? 'gets its 5 points back' : 'loses the point it earned'}` : ''}.`}
                                                close={() => setDeleting(null)}
                                                confirm={() => onDelete(deleting)}/>}
    </>
}

function Reward({sale}: { sale: Sale }) {
    if (sale.redeemed) return <span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Redeemed</span>;
    if (sale.loyaltyCode && sale.loyaltyCode !== '—') return <span className="text-xs text-blue-600">+1 point</span>;
    return <span className="text-xs text-slate-300">—</span>;
}

// Phones get one card per record. Five columns cannot be read on a 390px screen, and the
// sideways scroll the table used to need hides the amount — the one figure that matters.
// The table returns at lg, where the 64-wide sidebar still leaves it room.
function SalesTable({sales, empty = 'No sales recorded yet.', onEdit, onDelete}: {
    sales: Sale[];
    empty?: string;
    onEdit?: (s: Sale) => void;
    onDelete?: (s: Sale) => void
}) {
    if (!sales.length) return <p className="px-5 py-10 text-center text-sm text-slate-400">{empty}</p>;
    return <>
        <ul className="divide-y divide-slate-100 lg:hidden">{sales.map(s => <li key={s.id} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3"><span
                className="font-medium">{s.loyaltyCode}</span><b className="shrink-0">{money(s.amount)}</b></div>
            <p className="mt-1 text-sm text-slate-500">{s.service} · {s.payment}</p>
            <div className="mt-2 flex items-center justify-between gap-3"><Reward sale={s}/>
                <div className="flex shrink-0 items-center gap-3"><span
                    className="text-xs text-slate-400">{dayLabel(dateOf(s))} · {timeLabel(dateOf(s))}</span>
                    {onEdit && <RowActions label={`${s.service} sale`} onEdit={() => onEdit(s)}
                                           onDelete={onDelete && (() => onDelete(s))}/>}</div>
            </div>
        </li>)}</ul>
        <table className="hidden w-full text-left text-sm lg:table">
            <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
            <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Loyalty code</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Reward</th>
                <th className="px-5 py-3 text-right">Amount</th>
                {onEdit && <th className="px-5 py-3 text-right"><span className="sr-only">Actions</span></th>}
            </tr>
            </thead>
            {/* Time under the day rather than in its own column: it is what tells two otherwise
                identical washes apart, and it is only ever read alongside the date. */}
            <tbody>{sales.map(s => <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dayLabel(dateOf(s))}<span
                    className="block text-xs text-slate-400">{timeLabel(dateOf(s))}</span></td>
                <td className="px-5 py-4 font-medium">{s.loyaltyCode}</td>
                <td className="px-5 py-4 text-slate-500">{s.service}</td>
                <td className="px-5 py-4 text-slate-500">{s.payment}</td>
                <td className="px-5 py-4"><Reward sale={s}/></td>
                <td className="px-5 py-4 text-right font-semibold">{money(s.amount)}</td>
                {onEdit && <td className="px-5 py-4">
                    <div className="flex justify-end"><RowActions label={`${s.service} sale`} onEdit={() => onEdit(s)}
                                                                  onDelete={onDelete && (() => onDelete(s))}/></div>
                </td>}
            </tr>)}</tbody>
        </table>
    </>
}

function LoyaltySection({members}: { members: Loyalty[] }) {
    // Resolve fallback codes against the whole list before paging: codeFor() numbers by
    // position, so a page-2 slice would start counting at LOY-001 again.
    // Points are floored at 0 for display: deleting a sale whose point was already spent
    // leaves the stored balance short, and a card reading "−1 / 5 points" is not something a
    // customer holding a stamp card can be shown. See removeSale.
    const coded = useMemo(() => members.map((m, i) => ({
        ...m,
        code: codeFor(m, i),
        points: Math.max(0, m.points)
    })), [members]);
    const {slice, ...pager} = usePage(coded, undefined, 9);
    return <><p className="mb-7 text-sm text-slate-500">Loyalty codes are automatically created when a sale is recorded
        for a new customer.</p>
        {!coded.length && <p className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-400">No
            loyalty customers yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{slice.map(m => <section key={m.id}
                                                                                           className="rounded-2xl border border-slate-200 bg-white p-5">
            <span
                className="inline-block rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{m.code}</span>
            <div className="mt-5 flex gap-1">{[1, 2, 3, 4, 5].map(dot => <span key={dot}
                                                                               className={`h-7 flex-1 rounded-md ${dot <= m.points ? 'bg-blue-600' : 'bg-slate-100'}`}/>)}</div>
            <div className="mt-3 flex justify-between text-xs"><span
                className="font-semibold text-blue-700">{m.points} / 5 points</span><span
                className="text-slate-400">{m.redeemed} redeemed</span></div>
        </section>)}</div>
        <Pagination {...pager} className="mt-5"/>
    </>
}

function Expenses({records, onAdd, onUpdate, onDelete}: {
    records: Expense[];
    onAdd: () => void;
    onUpdate: (id: string, record: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
    onDelete?: (record: Expense) => Promise<void>
}) {
    // All time by default, for the same reason the sales ledger is — see Sales.
    const [range, setRange] = useState<Range>(() => rangeOf('All time'));
    const [editing, setEditing] = useState<Expense | null>(null),
        [deleting, setDeleting] = useState<Expense | null>(null);
    const filtered = useMemo(() => records.filter(x => inRange(dateOf(x), range)), [records, range]);
    // The header total covers everything in the range, not just the page being shown.
    const total = filtered.reduce((sum, x) => sum + x.amount, 0);
    const {slice, ...pager} = usePage(filtered, rangeKey(range));
    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p
            className="text-sm text-slate-500">Track every
            business cost and the payment source used.</p>
            <button onClick={onAdd}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={18}/> Record expense
            </button>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white">
            <div
                className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-bold">{money(total)}</h2><p
                    className="text-xs text-slate-400">{filtered.length} expense{filtered.length === 1 ? '' : 's'} · {rangeLabel(range)}</p>
                </div>
                <PeriodFilter range={range} setRange={setRange} label="Filter expenses by date"/>
            </div>
            {!filtered.length ?
                <p className="px-5 py-10 text-center text-sm text-slate-400">No expenses in this date range.</p> : <>
                    <ul className="divide-y divide-slate-100 lg:hidden">{slice.map(x => <li key={x.id}
                                                                                           className="px-5 py-4">
                        <div className="flex items-baseline justify-between gap-3"><span
                            className="font-medium">{x.category}</span><b className="shrink-0">{money(x.amount)}</b>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{x.note || '—'}</p>
                        <div className="mt-2 flex items-center justify-between gap-3"><span
                            className="inline-block rounded bg-slate-100 px-2 py-1 text-xs">{x.payment}</span>
                            <div className="flex shrink-0 items-center gap-3"><span
                                className="text-xs text-slate-400">{dayLabel(dateOf(x))} · {timeLabel(dateOf(x))}</span>
                                <RowActions label={`${x.category} expense`} onEdit={() => setEditing(x)}
                                            onDelete={onDelete && (() => setDeleting(x))}/></div>
                        </div>
                    </li>)}</ul>
                    <table className="hidden w-full text-left text-sm lg:table">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Note</th>
                            <th className="px-5 py-3">Payment</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                            <th className="px-5 py-3 text-right"><span className="sr-only">Actions</span></th>
                        </tr>
                        </thead>
                        <tbody>{slice.map(x => <tr key={x.id} className="border-t border-slate-100">
                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dayLabel(dateOf(x))}<span
                                className="block text-xs text-slate-400">{timeLabel(dateOf(x))}</span></td>
                            <td className="px-5 py-4 font-medium">{x.category}</td>
                            <td className="px-5 py-4 text-slate-500">{x.note || '—'}</td>
                            <td className="px-5 py-4"><span
                                className="rounded bg-slate-100 px-2 py-1 text-xs">{x.payment}</span></td>
                            <td className="px-5 py-4 text-right font-semibold">{money(x.amount)}</td>
                            <td className="px-5 py-4">
                                <div className="flex justify-end"><RowActions label={`${x.category} expense`}
                                                                              onEdit={() => setEditing(x)}
                                                                              onDelete={onDelete && (() => setDeleting(x))}/>
                                </div>
                            </td>
                        </tr>)}</tbody>
                    </table>
                    <Pagination {...pager}/></>}
        </section>
        {editing && <ExpenseModal record={editing} close={() => setEditing(null)}
                                  save={record => onUpdate(editing.id, record)}/>}
        {deleting && onDelete && <ConfirmDelete title="Delete this expense?"
                                                detail={`${deleting.category} · ${money(deleting.amount)} · ${dayLabel(dateOf(deleting))} at ${timeLabel(dateOf(deleting))}. This cannot be undone.`}
                                                close={() => setDeleting(null)}
                                                confirm={() => onDelete(deleting)}/>}
    </>
}

// One form for recording and correcting: an expense has no loyalty side, so unlike a sale
// there is nothing about it that can only be set at the moment it happens.
function ExpenseModal({record, close, save}: {
    record?: Expense;
    close: () => void;
    save: (record: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
}) {
    const [category, setCategory] = useState(record?.category || 'Supplies'),
        [payment, setPayment] = useState(record?.payment || 'Cash'), [note, setNote] = useState(record?.note || ''),
        [amount, setAmount] = useState(record ? String(record.amount) : '');
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({category, payment, note, amount: Number(amount)});
            close();
        } catch (err) {
            console.error('Failed to save expense', err);
            setError('Could not save this expense. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={record ? 'Edit expense' : 'Record an expense'} close={close}>
        <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Category<select value={category}
                                                                                              onChange={e => setCategory(e.target.value)}
                                                                                              className="mt-1 w-full rounded-xl border-slate-200">
            <option>Supplies</option>
            <option>Staff</option>
            <option>Utilities</option>
            <option>Maintenance</option>
            <option>Transport</option>
            <option>Other</option>
        </select></label><label className="block text-sm font-medium">Payment source<select value={payment}
                                                                                            onChange={e => setPayment(e.target.value)}
                                                                                            className="mt-1 w-full rounded-xl border-slate-200">
            <option>Cash</option>
            <option>Transfer</option>
            <option>POS</option>
        </select></label><label className="block text-sm font-medium">Amount (₦)<input required min="1" type="number"
                                                                                       value={amount}
                                                                                       onChange={e => setAmount(e.target.value)}
                                                                                       className="mt-1 w-full rounded-xl border-slate-200"/></label><label
            className="block text-sm font-medium">Note <span
            className="font-normal text-slate-400">(optional)</span><input value={note}
                                                                           onChange={e => setNote(e.target.value)}
                                                                           placeholder="What was this for?"
                                                                           className="mt-1 w-full rounded-xl border-slate-200"/></label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : record ? 'Save changes' : 'Save expense'}</button>
        </form>
    </Modal>
}

function Eod({totals, expenses}: { totals: ReturnType<typeof totalSales>; expenses: Expense[] }) {
    // Today's cash only — the sales side is already scoped to today, so netting every expense
    // ever recorded against it would understate the cash actually in the drawer.
    const cashToday = expenses.filter(x => x.payment === 'Cash' && isToday(dateOf(x)));
    const cashExpenses = cashToday.reduce((sum, x) => sum + x.amount, 0),
        balance = totals.cash - cashExpenses;
    // The same figures as the card below, in the order they are read off it. The individual
    // cash expenses are itemised because the person receiving this is being told to expect
    // less cash than the day took, and the deduction has to be checkable from the message
    // alone — they cannot see the desk. Asterisks are WhatsApp's bold.
    const report = [
        '*Jaranow Car Wash — End of day*',
        longDate(),
        '',
        `Sales: ${totals.count} transaction${totals.count === 1 ? '' : 's'} · ${money(totals.revenue)}`,
        `• Transfer: ${money(totals.transfer)}`,
        `• POS: ${money(totals.pos)}`,
        `• Cash: ${money(totals.cash)}`,
        ...(totals.redemptions ? [`• Free washes redeemed: ${totals.redemptions}`] : []),
        '',
        `Cash expenses: -${money(cashExpenses)}`,
        ...cashToday.map(x => `• ${x.category}${x.note ? ` — ${x.note}` : ''}: ${money(x.amount)}`),
        '',
        `*Cash to transfer: ${money(balance)}*`
    ].join('\n');
    // Opens WhatsApp with the summary drafted; whoever is closing up still presses send, so
    // a desk left on the End of day screen cannot fire a report on its own.
    const send = () => window.open(`https://wa.me/${EOD_REPORT_PHONE}?text=${encodeURIComponent(report)}`, '_blank');
    return <div className="mx-auto max-w-2xl"><p className="mb-7 text-sm text-slate-500">Review today’s collection and
        settle the cash balance to the Jaranow account.</p>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><ClipboardCheck/>
                </div>
                <div><h2 className="font-bold">End-of-day reconciliation</h2><p
                    className="text-xs text-slate-400">{longDate()}</p></div>
            </div>
            <div className="my-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between"><span>Transfer sales</span><b>{money(totals.transfer)}</b></div>
                <div className="flex justify-between"><span>POS sales</span><b>{money(totals.pos)}</b></div>
                <div className="flex justify-between"><span>Cash sales</span><b>{money(totals.cash)}</b></div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-red-600">
                    <span>Cash expenses</span><b>− {money(cashExpenses)}</b></div>
            </div>
            <div className="rounded-2xl bg-blue-600 p-5 text-white"><p
                className="text-sm font-medium text-blue-100">Cash balance to transfer</p><p
                className="mt-2 text-3xl font-bold">{money(balance)}</p><p
                className="mt-2 text-sm leading-6 text-blue-100">Transfer this cash balance to the Jaranow account after
                expenses.</p></div>
            <button type="button" onClick={send}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white">
                <Forward size={17}/> Send report on WhatsApp
            </button>
        </section>
    </div>
}

function Reports({sales, loyalty, expenses}: { sales: Sale[]; loyalty: Loyalty[]; expenses: Expense[] }) {
    const [range, setRange] = useState<Range>(() => rangeOf('This month'));
    const period = rangeLabel(range);
    const filtered = useMemo(() => sales.filter(s => inRange(dateOf(s), range)), [sales, range]);
    const filteredExpenses = useMemo(() => expenses.filter(x => inRange(dateOf(x), range)), [expenses, range]);
    const totals = totalSales(filtered), points = loyalty.reduce((sum, x) => sum + Math.max(0, x.points), 0);
    const totalExpenses = filteredExpenses.reduce((sum, x) => sum + x.amount, 0), netIncome = totals.revenue - totalExpenses;
    const {slice, ...pager} = usePage(filtered, rangeKey(range));
    return <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><p
            className="text-sm text-slate-500">Full operational and loyalty performance.</p><PeriodFilter range={range}
                                                                                                          setRange={setRange}
                                                                                                          label="Filter report by date"/>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat title="Revenue" value={money(totals.revenue)}
                                                                        icon={CircleDollarSign}
                                                                        tint="bg-blue-50 text-blue-600"
                                                                        note={`${totals.count} sales`}/><Stat
            title="Loyalty points" value={String(points)} icon={Gift} tint="bg-violet-50 text-violet-600"
            note="Currently held by customers"/><Stat title="Free washes" value={String(totals.redemptions)}
                                                      icon={Sparkles} tint="bg-emerald-50 text-emerald-600"
                                                      note="Redemptions in period"/><Stat title="Average sale"
                                                                                          value={money(totals.count ? totals.revenue / totals.count : 0)}
                                                                                          icon={BarChart3}
                                                                                          tint="bg-amber-50 text-amber-600"
                                                                                          note="Revenue per transaction"/>
        </div>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><PiggyBank/>
                </div>
                <div><h2 className="font-bold">Net income</h2><p className="text-xs text-slate-400">Revenue after
                    expenses · {period}</p></div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Revenue</p><p
                    className="mt-1 text-xl font-bold">{money(totals.revenue)}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Expenses</p><p
                    className="mt-1 text-xl font-bold text-red-600">− {money(totalExpenses)}</p></div>
                <div className={`rounded-xl p-4 text-white ${netIncome >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}><p
                    className="text-sm text-white/80">Net income</p><p
                    className="mt-1 text-xl font-bold">{money(netIncome)}</p></div>
            </div>
        </section>
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Sales by
                service</h2>
                <div className="mt-6 space-y-5">{(Object.keys(SERVICES) as Service[]).map(service => {
                    const value = filtered.filter(s => s.service === service).reduce((sum, s) => sum + s.amount, 0);
                    const width = `${Math.min(100, (value / Math.max(1, totals.revenue)) * 100)}%`;
                    return <div key={service}>
                        <div className="mb-2 flex justify-between text-sm"><span>{service}</span><b>{money(value)}</b>
                        </div>
                        <div className="h-2 overflow-hidden rounded bg-slate-100">
                            <div className="h-full rounded bg-blue-600" style={{width}}/>
                        </div>
                    </div>;
                })}</div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Payment
                analysis</h2>
                <div className="mt-6 space-y-4">{['Cash', 'Transfer', 'POS'].map(method => {
                    const value = filtered.filter(s => s.payment === method).reduce((sum, s) => sum + s.amount, 0);
                    return <div key={method} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <span>{method}</span><b>{money(value)}</b></div>;
                })}</div>
            </section>
        </div>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="p-5"><h2 className="font-bold">Sales in selected period</h2></div>
            <SalesTable sales={slice} empty="No sales recorded in this period."/><Pagination {...pager}/></section>
    </>;
}

function totalSales(sales: Sale[]) {
    const byPayment = (payment: string) => sales.filter(s => s.payment === payment).reduce((sum, s) => sum + s.amount, 0);
    return {
        revenue: sales.reduce((sum, s) => sum + s.amount, 0),
        count: sales.length,
        cash: byPayment('Cash'),
        transfer: byPayment('Transfer'),
        pos: byPayment('POS'),
        redemptions: sales.filter(s => s.redeemed).length
    };
}

function periodStart(period: string) {
    const now = new Date();
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    if (period === 'Yesterday') d.setDate(d.getDate() - 1); else if (period === 'Last 3 days') d.setDate(d.getDate() - 2); else if (period === 'Last 7 days') d.setDate(d.getDate() - 6); else if (period === 'This week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); else if (period === 'This month') d.setDate(1); else if (period === 'Last month') {
        d.setMonth(d.getMonth() - 1, 1);
    } else if (period === 'Last 3 months') d.setMonth(d.getMonth() - 3); else if (period === 'Last 6 months') d.setMonth(d.getMonth() - 6); else if (period === '1 year') d.setFullYear(d.getFullYear() - 1); else if (period === 'Last year') {
        d.setFullYear(d.getFullYear() - 1, 0, 1);
    }
    return d;
}

function periodEnd(period: string) {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    if (period === 'Yesterday') {
        end.setDate(end.getDate() - 1);
    }
    if (period === 'Last month') {
        end.setDate(0);
    }
    if (period === 'Last year') {
        end.setFullYear(end.getFullYear() - 1, 11, 31);
    }
    return end;
}

function inPeriod(date: Date, period: string) {
    if (period === 'All time') return true;
    return date >= periodStart(period) && date <= periodEnd(period);
}

function inRange(date: Date, range: Range) {
    if (range.preset !== CUSTOM) return inPeriod(date, range.preset);
    if (range.from && date < startOfDay(dayFrom(range.from))) return false;
    return !(range.to && date > endOfDay(dayFrom(range.to)));
}

// Nothing re-renders on its own at midnight, so a desk left open overnight would keep
// counting yesterday's sales as "today" until someone reloaded. Checking once a minute rolls
// the header date and every today-scoped figure over on their own.
function useDayTick() {
    const [day, setDay] = useState(() => startOfDay(new Date()).getTime());
    useEffect(() => {
        const id = setInterval(() => setDay(current => {
            const now = startOfDay(new Date()).getTime();
            return now === current ? current : now;
        }), 60_000);
        return () => clearInterval(id);
    }, []);
    return day;
}

// The desk is a tablet held one-handed at the forecourt, where the hamburger sits in the far
// top-left corner — the one place a thumb cannot reach without regripping. So the drawer also
// answers a swipe in from the left edge, and a swipe back anywhere closes it.
const EDGE_ZONE = 28;   // px from the left edge that starts an opening swipe
const SWIPE_MIN = 55;   // px of travel before it counts as a swipe rather than a tap that moved

function useDrawerSwipe(open: boolean, setOpen: (v: boolean) => void) {
    useEffect(() => {
        let startX = 0, startY = 0, tracking = false;
        const start = (e: TouchEvent) => {
            const touch = e.touches[0];
            tracking = e.touches.length === 1
                // Above md the sidebar is permanent, not a drawer — there is nothing to open.
                && window.matchMedia('(max-width: 767px)').matches
                // A modal owns the screen while it is up; a swipe across it is not aimed here.
                && !(e.target instanceof Element && e.target.closest('[data-modal]'))
                // Open from the edge only, so a swipe across a table is still a swipe across a
                // table. Closing works from anywhere, since the open drawer covers the screen.
                && (open || touch.clientX <= EDGE_ZONE);
            startX = touch.clientX;
            startY = touch.clientY;
        };
        const move = (e: TouchEvent) => {
            if (!tracking) return;
            const touch = e.touches[0], dx = touch.clientX - startX, dy = touch.clientY - startY;
            // A mostly-vertical drag is the page being scrolled. Concede it rather than
            // stealing the gesture half way down a long list of sales.
            if (Math.abs(dy) > Math.abs(dx)) {
                tracking = false;
                return;
            }
            if (Math.abs(dx) < SWIPE_MIN) return;
            tracking = false;
            setOpen(dx > 0);
        };
        const end = () => {
            tracking = false;
        };
        // Passive throughout: the drawer slides via a CSS transform, so nothing here needs to
        // preventDefault, and a non-passive touchmove would cost scroll performance everywhere.
        const opts = {passive: true} as const;
        document.addEventListener('touchstart', start, opts);
        document.addEventListener('touchmove', move, opts);
        document.addEventListener('touchend', end, opts);
        document.addEventListener('touchcancel', end, opts);
        return () => {
            document.removeEventListener('touchstart', start);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', end);
            document.removeEventListener('touchcancel', end);
        };
    }, [open, setOpen]);
}

type Pager = { page: number; pages: number; total: number; size: number; setPage: (p: number) => void };

// Live snapshots keep changing the list under the reader, so the page is clamped rather than
// reset — adding a sale on page 3 leaves you on page 3. Pass resetKey for a change that makes
// the current page meaningless (a new report period), which does send you back to page 1.
function usePage<T>(items: T[], resetKey?: unknown, size = 10): Pager & { slice: T[] } {
    const [page, setPage] = useState(1);
    useEffect(() => setPage(1), [resetKey]);
    const pages = Math.max(1, Math.ceil(items.length / size));
    const current = Math.min(page, pages);
    return {
        slice: items.slice((current - 1) * size, current * size),
        page: current,
        pages,
        total: items.length,
        size,
        setPage
    };
}

// One control behind every date filter on the desk. The presets answer "how are we doing",
// the custom pair answers "what happened on the 14th" — which is the question someone has
// when a customer disputes a wash, and no fixed preset ever lands on it.
function PeriodFilter({range, setRange, label = 'Date range'}: {
    range: Range;
    setRange: (r: Range) => void;
    label?: string
}) {
    const today = isoDay(new Date());
    // Switching to Custom seeds the pair from the preset you were on, so leaving "Last 7 days"
    // starts you on those seven days with an end to nudge, rather than on a blank pair that
    // shows everything until both halves are filled in.
    const pick = (preset: string) => setRange(preset !== CUSTOM || range.preset === 'All time' ? rangeOf(preset) : {
        preset,
        from: isoDay(periodStart(range.preset)),
        to: isoDay(periodEnd(range.preset))
    });
    const field = 'rounded-xl border-slate-200 text-sm';
    return <div className="flex flex-wrap items-center gap-2">
        <select aria-label={label} value={range.preset} onChange={e => pick(e.target.value)} className={field}>
            {PERIODS.map(p => <option key={p}>{p}</option>)}
            <option value={CUSTOM}>{CUSTOM}…</option>
        </select>
        {range.preset === CUSTOM && <>
            <input type="date" aria-label="From date" value={range.from} max={range.to || today}
                   onChange={e => setRange({...range, from: e.target.value})} className={field}/>
            <span className="text-sm text-slate-400">to</span>
            <input type="date" aria-label="To date" value={range.to} min={range.from} max={today}
                   onChange={e => setRange({...range, to: e.target.value})} className={field}/>
        </>}
    </div>;
}

function Pagination({page, pages, total, size, setPage, className = 'border-t border-slate-100 px-5 py-4'}: Pager & {
    className?: string
}) {
    if (total <= size) return null;
    const step = 'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40';
    return <div className={`flex items-center justify-between gap-3 ${className}`}><p
        className="text-xs text-slate-400">{(page - 1) * size + 1}–{Math.min(page * size, total)} of {total}</p>
        <div className="flex items-center gap-2"><span className="text-xs text-slate-400">Page {page} of {pages}</span>
            <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}
                    className={step}><ChevronLeft size={17}/></button>
            <button type="button" aria-label="Next page" disabled={page === pages} onClick={() => setPage(page + 1)}
                    className={step}><ChevronRight size={17}/></button>
        </div>
    </div>
}

function Stat({title, value, icon: Icon, tint, note}: {
    title: string;
    value: string;
    icon: typeof CircleDollarSign;
    tint: string;
    note: string
}) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{title}</p>
            <div className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon size={19}/></div>
        </div>
        <p className="mt-5 text-2xl font-bold tracking-tight">{value}</p><p
        className="mt-1 text-xs text-slate-400">{note}</p></section>
}

function Modal({title, close, children}: { title: string; close: () => void; children: React.ReactNode }) {
    // data-modal marks the layer for useDrawerSwipe, which ignores gestures that start inside
    // it — a swipe across an open form is not a request to open the sidebar behind it.
    return <div data-modal role="dialog" aria-modal="true" aria-label={title}
                className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
        <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>
                <button type="button" onClick={close}><X size={20}/></button>
            </div>
            {children}</section>
    </div>
}
