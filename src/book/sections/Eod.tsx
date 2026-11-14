import {ClipboardCheck, Forward} from 'lucide-react';
import {EOD_REPORT_PHONE} from '../constants';
import {longDate, money} from '../format';
import type {Totals} from '../totals';
import type {Expense} from '../types';
import {Skeleton} from '../components/Skeleton';

export function Eod({totals, expenses, loading}: {
    totals: Totals;
    expenses: Expense[];
    loading: boolean
}) {
    // `expenses` is today's only.
    const cashToday = expenses.filter(x => x.payment === 'Cash');
    const cashExpenses = cashToday.reduce((sum, x) => sum + x.amount, 0),
        balance = totals.cash - cashExpenses;
    // Cash expenses are itemised so the recipient can check the deduction. *x* is WhatsApp bold.
    const report = [
        '*Jaranow Car wash — End of day*',
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
    const send = () => window.open(`https://wa.me/${EOD_REPORT_PHONE}?text=${encodeURIComponent(report)}`, '_blank');
    return <div className="mx-auto max-w-2xl"><p className="mb-7 text-sm text-slate-500">Today’s takings, and the cash to transfer
        to the Jaranow account.</p>
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><ClipboardCheck/>
                </div>
                <div><h2 className="font-bold">End-of-day reconciliation</h2><p
                    className="text-xs text-slate-400">Cash sales minus cash expenses</p></div>
            </div>
            <div aria-busy={loading} className="my-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex items-center justify-between"><span>Transfer sales</span>{loading ?
                    <Skeleton className="h-4 w-20"/> : <b>{money(totals.transfer)}</b>}</div>
                <div className="flex items-center justify-between"><span>POS sales</span>{loading ?
                    <Skeleton className="h-4 w-20"/> : <b>{money(totals.pos)}</b>}</div>
                <div className="flex items-center justify-between"><span>Cash sales</span>{loading ?
                    <Skeleton className="h-4 w-20"/> : <b>{money(totals.cash)}</b>}</div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-red-600">
                    <span>Cash expenses</span>{loading ? <Skeleton className="h-4 w-20"/> :
                    <b>− {money(cashExpenses)}</b>}</div>
            </div>
            <div aria-busy={loading} className="rounded-2xl bg-blue-600 p-5 text-white"><p
                className="text-sm font-medium text-blue-100">Cash balance to transfer</p>{loading ?
                <span aria-hidden className="mt-2 block h-9 w-40 animate-pulse rounded bg-blue-500"/> : <p
                    className="mt-2 text-3xl font-bold">{money(balance)}</p>}</div>
            {/* Disabled while loading, or the report would instruct a ₦0 transfer. */}
            <button type="button" onClick={send} disabled={loading}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-60">
                <Forward size={17}/> {loading ? 'Loading today’s figures…' : 'Send report on WhatsApp'}
            </button>
        </section>
    </div>
}
