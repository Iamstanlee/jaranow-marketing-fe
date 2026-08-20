import React, {useEffect, useState} from 'react';
import {
    BarChart3,
    CalendarDays,
    ClipboardCheck,
    Gift,
    LayoutDashboard,
    LogOut,
    Menu,
    Plus,
    WalletCards,
    X
} from 'lucide-react';
import {greeting, longDate} from '../book/format';
import {clearSession, readSession, type Session, writeSession} from '../book/session';
import type {Role, Section} from '../book/types';
import {useBook} from '../book/hooks/useBook';
import {useDayTick} from '../book/hooks/useDayTick';
import {useDrawerSwipe} from '../book/hooks/useDrawerSwipe';
import {useToasts} from '../book/hooks/useToasts';
import {ExpenseModal} from '../book/components/ExpenseModal';
import {PinGate} from '../book/components/PinGate';
import {SaleModal} from '../book/components/SaleModal';
import {Toasts} from '../book/components/Toasts';
import {Eod} from '../book/sections/Eod';
import {Expenses} from '../book/sections/Expenses';
import {LoyaltySection} from '../book/sections/Loyalty';
import {Overview} from '../book/sections/Overview';
import {Reports} from '../book/sections/Reports';
import {Roster} from '../book/sections/Roster';
import {Sales} from '../book/sections/Sales';

export default function Bookkeeping() {
    const [session, setSession] = useState<Session | null>(readSession), [pin, setPin] = useState(''), [pinError, setPinError] = useState('');
    const role = session?.role ?? null;
    const {toasts, toast, dismiss} = useToasts();
    const lock = () => {
        clearSession();
        setSession(null);
        setPin('');
        toast('Book locked.', 'info');
    };
    const [section, setSection] = useState<Section>('overview');
    const [saleModal, setSaleModal] = useState(false), [expenseModal, setExpenseModal] = useState(false),
        [menuOpen, setMenuOpen] = useState(false);
    const day = useDayTick();
    useDrawerSwipe(menuOpen, setMenuOpen);
    const book = useBook(day, toast);
    const {ready} = book;

    // Only covers arriving here by client-side navigation. What makes the app installable
    // is the manifest baked into build/__/book/index.html by scripts/prerender-meta.js —
    // by the time this effect runs the browser has already read whatever manifest the
    // document shipped with, and an install captured then carries the wrong start_url.
    useEffect(() => {
        const manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
        const previousManifest = manifest?.getAttribute('href');
        const previousTitle = document.title;
        if (manifest) manifest.setAttribute('href', `${process.env.PUBLIC_URL}/bookkeeping-manifest.json`);
        document.title = 'Book';
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
                toast('Session expired — the book was locked.', 'warning');
            }
        };
        const id = setTimeout(check, session.expires - Date.now());
        document.addEventListener('visibilitychange', check);
        return () => {
            clearTimeout(id);
            document.removeEventListener('visibilitychange', check);
        };
    }, [session, toast]);

    const login = (e: React.FormEvent) => {
        e.preventDefault();
        // Which role you were let in as decides what you can see (reports are admin-only), so
        // the unlock says it rather than leaving it to be inferred from the sidebar.
        const unlock = (as: Role) => {
            setSession(writeSession(as));
            toast(`Book unlocked — ${as} access.`);
        };
        if (pin === process.env.REACT_APP_ADMIN_PIN && pin) unlock('admin'); else if (pin === process.env.REACT_APP_STAFF_PIN && pin) unlock('staff'); else setPinError(process.env.REACT_APP_ADMIN_PIN ? 'Incorrect PIN. Please try again.' : 'Set REACT_APP_ADMIN_PIN and REACT_APP_STAFF_PIN in .env first.');
    };

    if (!role) return <><PinGate pin={pin} setPin={setPin} error={pinError} login={login}/><Toasts toasts={toasts}
                                                                                                   dismiss={dismiss}/></>;
    // The rota is on the menu for both roles: staff read it, admin sets it. Reports stay
    // admin-only — the difference is that a rota is about the people, and the books are not.
    const nav: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [{
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard
    }, {id: 'sales', label: 'Sales records', icon: Plus}, {
        id: 'loyalty',
        label: 'Loyalty',
        icon: Gift
    }, {id: 'expenses', label: 'Expenses', icon: WalletCards}, {
        id: 'roster',
        label: 'Rota',
        icon: CalendarDays
    }, {
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
                        className="mt-4 flex items-center gap-2 text-xs text-slate-300"><LogOut size={14}/> Lock book
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
            {book.syncError && <div role="alert"
                                    className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 md:px-9">{book.syncError}</div>}
            <div className="mx-auto max-w-7xl p-5 md:p-9">{section === 'overview' &&
                <Overview totals={book.totals} sales={book.todaySales} expenses={book.todayExpenses}
                          staff={book.staff} roster={book.roster}
                          loading={!ready.sales || !ready.expenses}
                          rosterLoading={!ready.staff || !ready.roster}
                          onSale={() => setSaleModal(true)}
                          onChange={setSection}/>} {section === 'sales' &&
                <Sales sales={book.sales} role={role} loading={!ready.sales}
                       requestHistory={book.requestHistory} historyLoading={book.historyLoading}
                       onSale={() => setSaleModal(true)}
                       onUpdate={book.updateSale}
                       onDelete={role === 'admin' ? book.removeSale : undefined}/>} {section === 'loyalty' &&
                <LoyaltySection members={book.loyalty} loading={!ready.loyalty}/>} {section === 'expenses' &&
                <Expenses records={book.expenseRecords} role={role} loading={!ready.expenses}
                          onAdd={() => setExpenseModal(true)}
                          onUpdate={book.updateExpense}
                          onDelete={role === 'admin' ? book.removeExpense : undefined}/>} {section === 'roster' &&
                <Roster staff={book.staff} roster={book.roster} role={role}
                        loading={!ready.staff || !ready.roster}
                        onAddStaff={book.addStaff} onUpdateStaff={book.updateStaff} onRemoveStaff={book.removeStaff}
                        onAssign={book.assignDuty} onUpdateDuty={book.updateDuty}
                        onRemoveDuty={book.removeDuty}/>} {section === 'eod' &&
                <Eod totals={book.totals} expenses={book.expenseRecords}
                     loading={!ready.sales || !ready.expenses}/>} {section === 'reports' && role === 'admin' &&
                <Reports sales={book.sales} loyalty={book.loyalty} expenses={book.expenseRecords}
                         loading={!ready.sales || !ready.loyalty || !ready.expenses}
                         requestHistory={book.requestHistory} historyLoading={book.historyLoading}/>}</div>
        </main>
        {saleModal && <SaleModal members={book.loyalty} close={() => setSaleModal(false)} save={book.addSale}/>}
        {expenseModal && <ExpenseModal close={() => setExpenseModal(false)} save={book.addExpense}/>}
        <Toasts toasts={toasts} dismiss={dismiss}/></div>;
}
