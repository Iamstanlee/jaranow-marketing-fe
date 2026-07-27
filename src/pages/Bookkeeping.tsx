import {useEffect, useMemo, useState} from 'react';
import {
    addDoc,
    collection,
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
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    ClipboardCheck,
    Gift,
    LayoutDashboard,
    LogOut,
    Menu, PiggyBank,
    Plus,
    ShieldCheck,
    Sparkles,
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
const SERVICES = {'Exterior wash': 2000, 'Full wash': 3000, 'Vacuum wash': 4000} as const;
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
const isToday = (date: Date) => startOfDay(date).getTime() === startOfDay(new Date()).getTime();
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
    service: 'Vacuum wash',
    payment: 'Cash',
    amount: SERVICES['Vacuum wash']
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
    const [role, setRole] = useState<Role | null>(null), [pin, setPin] = useState(''), [pinError, setPinError] = useState('');
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
    const todaySales = useMemo(() => sales.filter(s => startOfDay(dateOf(s)).getTime() === day), [sales, day]);
    const totals = useMemo(() => totalSales(todaySales), [todaySales]);
    const login = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === process.env.REACT_APP_ADMIN_PIN && pin) setRole('admin'); else if (pin === process.env.REACT_APP_STAFF_PIN && pin) setRole('staff'); else setPinError(process.env.REACT_APP_ADMIN_PIN ? 'Incorrect PIN. Please try again.' : 'Set REACT_APP_ADMIN_PIN and REACT_APP_STAFF_PIN in .env first.');
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
    };
    const addExpense = async (record: Omit<Expense, 'id' | 'createdAt'>) => {
        if (db) await addDoc(collection(db, 'car_wash_expenses'), {
            ...record,
            createdAt: serverTimestamp()
        }); else setExpenseRecords(list => [{id: crypto.randomUUID(), ...record}, ...list]);
    };
    if (!role) return <PinGate pin={pin} setPin={setPin} error={pinError} login={login}/>;
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
                <button onClick={() => {
                    setRole(null);
                    setPin('');
                }} className="mt-4 flex items-center gap-2 text-xs text-slate-300"><LogOut size={14}/> Lock books
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
            <div className="mx-auto max-w-7xl p-5 md:p-9">{section === 'overview' &&
                <Overview totals={totals} sales={todaySales} onSale={() => setSaleModal(true)}
                          onChange={setSection}/>} {section === 'sales' &&
                <Sales sales={sales} onSale={() => setSaleModal(true)}/>} {section === 'loyalty' &&
                <LoyaltySection members={loyalty}/>} {section === 'expenses' &&
                <Expenses records={expenseRecords} onAdd={() => setExpenseModal(true)}/>} {section === 'eod' &&
                <Eod totals={totals} expenses={expenseRecords}/>} {section === 'reports' && role === 'admin' &&
                <Reports sales={sales} loyalty={loyalty} expenses={expenseRecords}/>}</div>
        </main>
        {saleModal && <SaleModal members={loyalty} close={() => setSaleModal(false)} save={addSale}/>} {expenseModal &&
        <ExpenseModal close={() => setExpenseModal(false)} save={addExpense}/>}</div>;
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
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    // Codes are stored zero-padded to three digits (LOY-001) so a typed "1" and the
    // auto-generated "001" are the same member. Match, save and display the padded form.
    const normalizedCode = code ? `LOY-${code.replace(/\D/g, '').padStart(3, '0')}` : '';
    const member = members.find((x, i) => codeFor(x, i) === normalizedCode);
    const newCode = Boolean(normalizedCode && !member);
    const canRedeem = Boolean(member && member.points >= 5);
    const amount = redeem ? 0 : SERVICES[service];
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
        </div>}<label className="block text-sm font-medium">Service<select value={service}
                                                                           onChange={e => setService(e.target.value as Service)}
                                                                           className="mt-1 w-full rounded-xl border-slate-200">
            <option>Exterior wash</option>
            <option>Full wash</option>
            <option>Vacuum wash</option>
        </select></label>{canRedeem && <label
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"><input
            type="checkbox" checked={redeem} onChange={e => setRedeem(e.target.checked)}
            className="rounded text-emerald-600"/>Redeem 5 points for this wash</label>}<label
            className="block text-sm font-medium">Payment method<select value={payment}
                                                                        onChange={e => setPayment(e.target.value)}
                                                                        className="mt-1 w-full rounded-xl border-slate-200">
            <option>Transfer</option>
            <option>Cash</option>
            <option>POS</option>
        </select></label>
            <div className="rounded-xl bg-slate-100 p-4"><span className="text-sm text-slate-500">Amount due</span><b
                className="float-right text-lg">{money(amount)}</b></div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : `Save sale ${member && !redeem ? '• earn 1 point' : ''}`}</button>
        </form>
    </Modal>
}

function Overview({totals, sales, onSale, onChange}: {
    totals: ReturnType<typeof totalSales>;
    sales: Sale[];
    onSale: () => void;
    onChange: (s: Section) => void
}) {
    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p
            className="text-sm text-slate-500">A clear snapshot of your business today.</p>
            <button onClick={onSale}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={18}/> Record sale
            </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat title="Today's sales"
                                                                        value={money(totals.revenue)}
                                                                        icon={PiggyBank}
                                                                        tint="bg-blue-50 text-blue-600"
                                                                        note={`${totals.count} transactions`}/><Stat
            title="Transactions" value={String(totals.count)} icon={CircleDollarSign} tint="bg-violet-50 text-violet-600"
            note="Sales recorded today"/><Stat title="Cash received" value={money(totals.cash)} icon={BarChart3}
                                               tint="bg-amber-50 text-amber-600" note="Ready to reconcile"/><Stat
            title="Rewards redeemed" value={String(totals.redemptions)} icon={Sparkles}
            tint="bg-emerald-50 text-emerald-600" note="Free washes today"/></div>
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

function Sales({sales, onSale}: { sales: Sale[]; onSale: () => void }) {
    const {slice, ...pager} = usePage(sales);
    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p
            className="text-sm text-slate-500">Every service and
            payment in one place.</p>
            <button onClick={onSale}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={18}/> Record sale
            </button>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white"><SalesTable sales={slice}/><Pagination {...pager}/></section>
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
function SalesTable({sales, empty = 'No sales recorded yet.'}: { sales: Sale[]; empty?: string }) {
    if (!sales.length) return <p className="px-5 py-10 text-center text-sm text-slate-400">{empty}</p>;
    return <>
        <ul className="divide-y divide-slate-100 lg:hidden">{sales.map(s => <li key={s.id} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3"><span
                className="font-medium">{s.loyaltyCode}</span><b className="shrink-0">{money(s.amount)}</b></div>
            <p className="mt-1 text-sm text-slate-500">{s.service} · {s.payment}</p>
            <div className="mt-2 flex items-center justify-between gap-3"><Reward sale={s}/><span
                className="shrink-0 text-xs text-slate-400">{dayLabel(dateOf(s))}</span></div>
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
            </tr>
            </thead>
            <tbody>{sales.map(s => <tr key={s.id} className="border-b border-slate-100 last:border-0">
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dayLabel(dateOf(s))}</td>
                <td className="px-5 py-4 font-medium">{s.loyaltyCode}</td>
                <td className="px-5 py-4 text-slate-500">{s.service}</td>
                <td className="px-5 py-4 text-slate-500">{s.payment}</td>
                <td className="px-5 py-4"><Reward sale={s}/></td>
                <td className="px-5 py-4 text-right font-semibold">{money(s.amount)}</td>
            </tr>)}</tbody>
        </table>
    </>
}

function LoyaltySection({members}: { members: Loyalty[] }) {
    // Resolve fallback codes against the whole list before paging: codeFor() numbers by
    // position, so a page-2 slice would start counting at LOY-001 again.
    const coded = useMemo(() => members.map((m, i) => ({...m, code: codeFor(m, i)})), [members]);
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

function Expenses({records, onAdd}: { records: Expense[]; onAdd: () => void }) {
    // The header total covers every expense on record, not just the page being shown.
    const total = records.reduce((sum, x) => sum + x.amount, 0);
    const {slice, ...pager} = usePage(records);
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
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div><h2 className="font-bold">Expense records</h2><p className="text-xs text-slate-400">All recorded
                    expenses</p></div>
                <b className="text-lg">{money(total)}</b></div>
            {!records.length ?
                <p className="px-5 py-10 text-center text-sm text-slate-400">No expenses recorded yet.</p> : <>
                    <ul className="divide-y divide-slate-100 lg:hidden">{slice.map(x => <li key={x.id}
                                                                                           className="px-5 py-4">
                        <div className="flex items-baseline justify-between gap-3"><span
                            className="font-medium">{x.category}</span><b className="shrink-0">{money(x.amount)}</b>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{x.note || '—'}</p>
                        <div className="mt-2 flex items-center justify-between gap-3"><span
                            className="inline-block rounded bg-slate-100 px-2 py-1 text-xs">{x.payment}</span><span
                            className="shrink-0 text-xs text-slate-400">{dayLabel(dateOf(x))}</span></div>
                    </li>)}</ul>
                    <table className="hidden w-full text-left text-sm lg:table">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-5 py-3">Date</th>
                            <th className="px-5 py-3">Category</th>
                            <th className="px-5 py-3">Note</th>
                            <th className="px-5 py-3">Payment</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody>{slice.map(x => <tr key={x.id} className="border-t border-slate-100">
                            <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dayLabel(dateOf(x))}</td>
                            <td className="px-5 py-4 font-medium">{x.category}</td>
                            <td className="px-5 py-4 text-slate-500">{x.note || '—'}</td>
                            <td className="px-5 py-4"><span
                                className="rounded bg-slate-100 px-2 py-1 text-xs">{x.payment}</span></td>
                            <td className="px-5 py-4 text-right font-semibold">{money(x.amount)}</td>
                        </tr>)}</tbody>
                    </table>
                    <Pagination {...pager}/></>}
        </section>
    </>
}

function ExpenseModal({close, save}: {
    close: () => void;
    save: (record: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
}) {
    const [category, setCategory] = useState('Supplies'), [payment, setPayment] = useState('Cash'), [note, setNote] = useState(''), [amount, setAmount] = useState('');
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
            console.error('Failed to record expense', err);
            setError('Could not save this expense. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title="Record an expense" close={close}>
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
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : 'Save expense'}</button>
        </form>
    </Modal>
}

function Eod({totals, expenses}: { totals: ReturnType<typeof totalSales>; expenses: Expense[] }) {
    // Today's cash only — the sales side is already scoped to today, so netting every expense
    // ever recorded against it would understate the cash actually in the drawer.
    const cashExpenses = expenses.filter(x => x.payment === 'Cash' && isToday(dateOf(x))).reduce((sum, x) => sum + x.amount, 0),
        balance = totals.cash - cashExpenses;
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
        </section>
    </div>
}

function Reports({sales, loyalty, expenses}: { sales: Sale[]; loyalty: Loyalty[]; expenses: Expense[] }) {
    const [period, setPeriod] = useState('This month');
    const filtered = useMemo(() => sales.filter(s => inPeriod(dateOf(s), period)), [sales, period]);
    const filteredExpenses = useMemo(() => expenses.filter(x => inPeriod(dateOf(x), period)), [expenses, period]);
    const totals = totalSales(filtered), points = loyalty.reduce((sum, x) => sum + x.points, 0);
    const totalExpenses = filteredExpenses.reduce((sum, x) => sum + x.amount, 0), netIncome = totals.revenue - totalExpenses;
    const {slice, ...pager} = usePage(filtered, period);
    return <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><p
            className="text-sm text-slate-500">Full operational and loyalty performance.</p><select value={period}
                                                                                                    onChange={e => setPeriod(e.target.value)}
                                                                                                    className="rounded-xl border-slate-200 text-sm">
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 3 days</option>
            <option>Last 7 days</option>
            <option>This week</option>
            <option>This month</option>
            <option>Last month</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>1 year</option>
            <option>Last year</option>
        </select></div>
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

function inPeriod(date: Date, period: string) {
    const start = periodStart(period);
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
    return date >= start && date <= end;
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
    return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
        <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>
                <button type="button" onClick={close}><X size={20}/></button>
            </div>
            {children}</section>
    </div>
}
