import {useMemo, useState} from 'react';
import {BarChart3, Car, Gift, PiggyBank, Receipt, Sparkles} from 'lucide-react';
import {currentService, PAYMENT_METHODS, SERVICES, type Service} from '../constants';
import {dateOf, isoDay, money, percent} from '../format';
import {type Range, rangeKey, rangeLabel, rangeOf, rangeTest} from '../period';
import {useHistory} from '../hooks/useHistory';
import {totalSales} from '../totals';
import type {Expense, Loyalty, Sale} from '../types';
import {usePage} from '../hooks/usePage';
import {Pagination} from '../components/Pagination';
import {PeriodFilter} from '../components/PeriodFilter';
import {SalesTable} from '../components/SalesTable';
import {Skeleton} from '../components/Skeleton';
import {Stat} from '../components/Stat';
import {ExpenseBreakdown} from './ExpenseBreakdown';
import {SalesTrend} from './SalesTrend';

export function Reports({sales, loyalty, expenses, loading, requestHistory, historyLoading}: {
    sales: Sale[];
    loyalty: Loyalty[];
    expenses: Expense[];
    loading: boolean;
    requestHistory: (from: number) => void;
    historyLoading: boolean
}) {
    const [range, setRange] = useState<Range>(() => rangeOf('This month'));
    useHistory(range, requestHistory, true);
    const period = rangeLabel(range);
    const within = useMemo(() => rangeTest(range), [range]);
    const filtered = useMemo(() => sales.filter(s => within(dateOf(s))), [sales, within]);
    const filteredExpenses = useMemo(() => expenses.filter(x => within(dateOf(x))), [expenses, within]);
    const totals = useMemo(() => totalSales(filtered), [filtered]);
    const points = useMemo(() => loyalty.reduce((sum, x) => sum + Math.max(0, x.points), 0), [loyalty]);
    const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, x) => sum + x.amount, 0), [filteredExpenses]);
    const netIncome = totals.revenue - totalExpenses;
    // One pass for trading days and the per-service split. Cars per *trading* day (days with a
    // sale); free washes count as cars.
    const {tradingDays, byService} = useMemo(() => {
        const days = new Set<string>(), split = new Map<Service, number>();
        for (const s of filtered) {
            days.add(isoDay(dateOf(s)));
            const service = currentService(s.service);
            split.set(service, (split.get(service) ?? 0) + s.amount);
        }
        return {tradingDays: days.size, byService: split};
    }, [filtered]);
    const carsPerDay = tradingDays ? totals.count / tradingDays : 0;
    const {slice, ...pager} = usePage(filtered, rangeKey(range));
    const pending = loading || historyLoading;
    return <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><p
            className="text-sm text-slate-500">Sales, costs and loyalty for the period.</p><PeriodFilter range={range}
                                                                                                          setRange={setRange}
                                                                                                          label="Filter report by date"/>
        </div>
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><PiggyBank/>
                </div>
                <div><h2 className="font-bold">Net income</h2><p className="text-xs text-slate-400">Revenue after
                    expenses · {period}</p></div>
            </div>
            {/* Neutral while loading, so it never flashes green then red. */}
            <div aria-busy={pending} className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Revenue</p>{pending ?
                    <Skeleton className="mt-2 h-6 w-24"/> :
                    <p className="mt-1 text-xl font-bold">{money(totals.revenue)}</p>}</div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Expenses</p>{pending ?
                    <Skeleton className="mt-2 h-6 w-24"/> :
                    <p className="mt-1 text-xl font-bold text-red-600">− {money(totalExpenses)}</p>}</div>
                <div
                    className={`rounded-xl p-4 ${pending ? 'bg-slate-100' : `text-white ${netIncome >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}`}>
                    <p className={`text-sm ${pending ? 'text-slate-500' : 'text-white/80'}`}>Net income</p>{pending ?
                    <Skeleton className="mt-2 h-6 w-24"/> :
                    <p className="mt-1 text-xl font-bold">{money(netIncome)}</p>}</div>
            </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Stat title="Sales" value={String(totals.count)} icon={Receipt} tint="bg-blue-50 text-blue-600"
                  note="Transactions in period" loading={pending}/>
            <Stat title="Loyalty points" value={String(points)} icon={Gift} tint="bg-violet-50 text-violet-600"
                  note="Currently held by customers" loading={pending}/>
            <Stat title="Free washes" value={String(totals.redemptions)} icon={Sparkles}
                  tint="bg-emerald-50 text-emerald-600" note="Redemptions in period" loading={pending}/>
            <Stat title="Average sale" value={money(totals.count ? totals.revenue / totals.count : 0)} icon={BarChart3}
                  tint="bg-amber-50 text-amber-600" note="Revenue per transaction" loading={pending}/>
            <Stat title="Cars per day" value={tradingDays ? carsPerDay.toFixed(1) : '—'} icon={Car}
                  tint="bg-sky-50 text-sky-600" loading={pending}
                  note={tradingDays ? `Across ${tradingDays} day${tradingDays === 1 ? '' : 's'} with sales` : 'No sales in period'}/>
        </div>
        <SalesTrend sales={sales} filtered={filtered} range={range} loading={pending}/>
        <ExpenseBreakdown expenses={filteredExpenses} revenue={totals.revenue} period={period} loading={pending}/>
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Sales by
                service</h2>
                <div aria-busy={pending} className="mt-6 space-y-5">{(Object.keys(SERVICES) as Service[]).map(service => {
                    const value = byService.get(service) ?? 0;
                    const share = totals.revenue > 0 ? value / totals.revenue : 0;
                    const width = `${Math.min(100, share * 100)}%`;
                    return <div key={service}>
                        <div className="mb-2 flex items-center justify-between text-sm"><span>{service}</span>{pending ?
                            <Skeleton className="h-4 w-24"/> :
                            <span className="flex items-baseline gap-2"><b>{money(value)}</b><span
                                className="w-12 text-right tabular-nums text-slate-400">{percent(share)}</span></span>}
                        </div>
                        <div className="h-2 overflow-hidden rounded bg-slate-100">
                            {!pending && <div className="h-full rounded bg-blue-600" style={{width}}/>}
                        </div>
                    </div>;
                })}</div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Payment
                analysis</h2>
                <div aria-busy={pending} className="mt-6 space-y-4">{PAYMENT_METHODS.map(method => {
                    const value = method === 'Cash' ? totals.cash : method === 'Transfer' ? totals.transfer : totals.pos;
                    return <div key={method} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <span>{method}</span>{pending ? <Skeleton className="h-4 w-20"/> : <b>{money(value)}</b>}</div>;
                })}</div>
            </section>
        </div>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="p-5"><h2 className="font-bold">Sales in selected period</h2></div>
            <SalesTable sales={slice} empty="No sales recorded in this period." loading={pending}
                        rows={5}/><Pagination {...pager}/></section>
    </>;
}
