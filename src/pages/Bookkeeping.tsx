import React, {lazy, Suspense, useEffect, useState} from 'react';
import {
    BarChart3,
    ClipboardCheck,
    Gauge,
    Gift,
    LayoutDashboard,
    Menu,
    PiggyBank,
    Plus,
    SquareUserRound,
    UserSearch,
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
import {AccountMenu} from '../book/components/AccountMenu';
import {ExpenseModal} from '../book/components/ExpenseModal';
import {PinGate} from '../book/components/PinGate';
import {SaleModal} from '../book/components/SaleModal';
import {Toasts} from '../book/components/Toasts';
import {Eod} from '../book/sections/Eod';
import {Expenses} from '../book/sections/Expenses';
import {LoyaltySection} from '../book/sections/Loyalty';
import {Overview} from '../book/sections/Overview';
import {Sales} from '../book/sections/Sales';

// Heavier sections load on first visit, so the desk paints Overview sooner.
const Payments = lazy(() => import('../book/sections/Payments').then(m => ({default: m.Payments})));
const Reports = lazy(() => import('../book/sections/Reports').then(m => ({default: m.Reports})));
const Staff = lazy(() => import('../book/sections/Staff').then(m => ({default: m.Staff})));
const Hiring = lazy(() => import('../book/sections/Hiring').then(m => ({default: m.Hiring})));

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
    const book = useBook(day, toast, role === 'admin');
    const {ready} = book;

    // Client-side navigation only; installs rely on the prerendered manifest (see CLAUDE.md "SEO").
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

    // Lock on expiry without a reload; the visibility check covers a tablet asleep past it.
    useEffect(() => {
        if (!session) return;
        const check = () => {
            if (!readSession()) {
                setSession(null);
                setPin('');
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
        const unlock = (as: Role) => {
            setSession(writeSession(as));
            toast(`Book unlocked — ${as} access.`);
        };
        if (pin === process.env.REACT_APP_ADMIN_PIN && pin) unlock('admin'); else if (pin === process.env.REACT_APP_STAFF_PIN && pin) unlock('staff'); else setPinError(process.env.REACT_APP_ADMIN_PIN ? 'Incorrect PIN. Please try again.' : 'Set REACT_APP_ADMIN_PIN and REACT_APP_STAFF_PIN in .env first.');
    };

    if (!role) return <><PinGate pin={pin} setPin={setPin} error={pinError} login={login}/><Toasts toasts={toasts}
                                                                                                   dismiss={dismiss}/></>;
    // Hiring and Reports are admin-only; sections enforce their own write permissions.
    const nav: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [{
        id: 'overview',
        label: 'Overview',
        icon: Gauge
    }, {id: 'sales', label: 'Sales records', icon: Plus}, {
        id: 'loyalty',
        label: 'Loyalty',
        icon: Gift
    }, {id: 'expenses', label: 'Expenses', icon: WalletCards},
        {
            id: 'eod',
            label: 'End of day',
            icon: ClipboardCheck
        }, {
            id: 'payments',
            label: 'Payments',
            icon: PiggyBank
        }, {
        id: 'roster',
        label: 'Staff',
        icon: SquareUserRound
        }, ...(role === 'admin' ? [{id: 'hiring' as const, label: 'Hiring', icon: UserSearch}, {
            id: 'reports' as const,
            label: 'Reports',
            icon: BarChart3
        }] : [])];
    const title = section === 'overview' ? greeting() : nav.find(x => x.id === section)?.label;
    return <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
        <aside
            className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white px-5 py-6 transition-transform md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-10 flex items-center gap-3">
                <div><p className="text-lg font-bold">jaranow</p><p className="text-xs text-slate-400">Book</p>
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
                <AccountMenu role={role} onLogout={lock}/>
            </header>
            {book.syncError && <div role="alert"
                                    className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800 md:px-9">{book.syncError}</div>}
            <div className="mx-auto max-w-7xl p-5 md:p-9"><Suspense fallback={<div role="status" aria-busy aria-label="Loading" className="h-40 animate-pulse rounded-2xl bg-slate-100"/>}>{section === 'overview' &&
                <Overview totals={book.totals} sales={book.todaySales} expenses={book.todayExpenses}
                          owing={book.owing} owingLoading={!ready.owing} onCollect={book.collectBalance}
                          staff={book.staff} roster={book.roster}
                          loading={!ready.sales || !ready.expenses}
                          rosterLoading={!ready.staff || !ready.roster}
                          onSale={() => setSaleModal(true)}
                          onChange={setSection}/>} {section === 'sales' &&
                <Sales sales={book.sales} owing={book.owing} owingLoading={!ready.owing} role={role} loading={!ready.sales}
                       requestHistory={book.requestHistory} historyLoading={book.historyLoading}
                       onSale={() => setSaleModal(true)}
                       onUpdate={book.updateSale} onCollect={book.collectBalance}
                       onDelete={role === 'admin' ? book.removeSale : undefined}/>} {section === 'loyalty' &&
                <LoyaltySection members={book.loyalty} loading={!ready.loyalty}
                                onAdjust={role === 'admin' ? book.adjustPoints : undefined}/>} {section === 'expenses' &&
                <Expenses records={book.expenseRecords} role={role} loading={!ready.expenses}
                          onAdd={() => setExpenseModal(true)}
                          onUpdate={book.updateExpense}
                          onDelete={role === 'admin' ? book.removeExpense : undefined}/>} {section === 'roster' &&
                <Staff staff={book.staff} roster={book.roster} attendance={book.attendance} role={role}
                       loading={!ready.staff || !ready.roster} attendanceLoading={!ready.attendance}
                       onSetMark={book.setMark}
                       onAddStaff={book.addStaff} onUpdateStaff={book.updateStaff}
                       onArchiveStaff={book.archiveStaff} onRestoreStaff={book.restoreStaff} onRemoveStaff={book.removeStaff}
                       onAssign={book.assignDuty} onUpdateDuty={book.updateDuty}
                       onRemoveDuty={book.removeDuty}/>} {section === 'eod' &&
                <Eod totals={book.totals} expenses={book.todayExpenses}
                     loading={!ready.sales || !ready.expenses}/>} {section === 'reports' && role === 'admin' &&
                <Reports sales={book.sales} loyalty={book.loyalty} expenses={book.expenseRecords}
                         loading={!ready.sales || !ready.loyalty || !ready.expenses}
                         requestHistory={book.requestHistory} historyLoading={book.historyLoading}/>} {section === 'payments' &&
                <Payments sales={book.sales} staff={book.staff} payouts={book.payouts} attendance={book.attendance}
                          roster={book.roster}
                          role={role}
                          loading={!ready.sales || !ready.staff || !ready.payouts || !ready.attendance || !ready.roster}
                          requestHistory={book.requestHistory} historyLoading={book.historyLoading}
                          onAddAdvance={book.addAdvance} onRemoveAdvance={book.removeAdvance}
                          onPay={book.markPaid} onUndo={book.undoPayout}/>} {section === 'hiring' && role === 'admin' &&
                <Hiring applicants={book.applicants} loading={!ready.applicants}
                        onUpdate={book.updateApplicant} onHire={book.hireApplicant}
                        onRemove={book.removeApplicant}/>}</Suspense></div>
        </main>
        {saleModal && <SaleModal members={book.loyalty} admin={role === 'admin'} close={() => setSaleModal(false)} save={book.addSale}/>}
        {expenseModal && <ExpenseModal admin={role === 'admin'} close={() => setExpenseModal(false)} save={book.addExpense}/>}
        <Toasts toasts={toasts} dismiss={dismiss}/></div>;
}
