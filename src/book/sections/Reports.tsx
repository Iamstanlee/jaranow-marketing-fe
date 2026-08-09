import {useMemo, useState} from 'react';
import {BarChart3, Car, CircleDollarSign, Gift, PiggyBank, Sparkles} from 'lucide-react';
import {SERVICES, type Service} from '../constants';
import {dateOf, isoDay, money} from '../format';
import {inRange, type Range, rangeKey, rangeLabel, rangeOf} from '../period';
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

export function Reports({sales, loyalty, expenses, loading}: {
    sales: Sale[];
    loyalty: Loyalty[];
    expenses: Expense[];
    loading: boolean
}) {
    const [range, setRange] = useState<Range>(() => rangeOf('This month'));
    const period = rangeLabel(range);
    const filtered = useMemo(() => sales.filter(s => inRange(dateOf(s), range)), [sales, range]);
    const filteredExpenses = useMemo(() => expenses.filter(x => inRange(dateOf(x), range)), [expenses, range]);
    const totals = totalSales(filtered), points = loyalty.reduce((sum, x) => sum + Math.max(0, x.points), 0);
    const totalExpenses = filteredExpenses.reduce((sum, x) => sum + x.amount, 0), netIncome = totals.revenue - totalExpenses;
    // Cars per *trading* day, not per calendar day: the divisor counts days that actually
    // carry a sale. A calendar divisor would read low for the whole of a part-finished month,
    // and lower still on "All time", where most of the range predates the books. A free wash
    // is a car through the bay, so redemptions count here even though they add no revenue.
    const tradingDays = useMemo(() => new Set(filtered.map(s => isoDay(dateOf(s)))).size, [filtered]);
    const carsPerDay = tradingDays ? totals.count / tradingDays : 0;
    const {slice, ...pager} = usePage(filtered, rangeKey(range));
    return <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><p
            className="text-sm text-slate-500">Full operational and loyalty performance.</p><PeriodFilter range={range}
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
            {/* The net card is coloured by its own sign, so while loading it stays neutral —
                a green "profit" panel that flips red once the expenses land is worse than
                one that says nothing yet. */}
            <div aria-busy={loading} className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Revenue</p>{loading ?
                    <Skeleton className="mt-2 h-6 w-24"/> :
                    <p className="mt-1 text-xl font-bold">{money(totals.revenue)}</p>}</div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Expenses</p>{loading ?
                    <Skeleton className="mt-2 h-6 w-24"/> :
                    <p className="mt-1 text-xl font-bold text-red-600">− {money(totalExpenses)}</p>}</div>
                <div
                    className={`rounded-xl p-4 ${loading ? 'bg-slate-100' : `text-white ${netIncome >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}`}>
                    <p className={`text-sm ${loading ? 'text-slate-500' : 'text-white/80'}`}>Net income</p>{loading ?
                    <Skeleton className="mt-2 h-6 w-24"/> :
                    <p className="mt-1 text-xl font-bold">{money(netIncome)}</p>}</div>
            </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Stat title="Revenue" value={money(totals.revenue)} icon={CircleDollarSign} tint="bg-blue-50 text-blue-600"
                  note={`${totals.count} sales`} loading={loading}/>
            <Stat title="Loyalty points" value={String(points)} icon={Gift} tint="bg-violet-50 text-violet-600"
                  note="Currently held by customers" loading={loading}/>
            <Stat title="Free washes" value={String(totals.redemptions)} icon={Sparkles}
                  tint="bg-emerald-50 text-emerald-600" note="Redemptions in period" loading={loading}/>
            <Stat title="Average sale" value={money(totals.count ? totals.revenue / totals.count : 0)} icon={BarChart3}
                  tint="bg-amber-50 text-amber-600" note="Revenue per transaction" loading={loading}/>
            <Stat title="Cars per day" value={tradingDays ? carsPerDay.toFixed(1) : '—'} icon={Car}
                  tint="bg-sky-50 text-sky-600" loading={loading}
                  note={tradingDays ? `Across ${tradingDays} day${tradingDays === 1 ? '' : 's'} with sales` : 'No sales in period'}/>
        </div>
        <SalesTrend sales={sales} filtered={filtered} range={range} loading={loading}/>
        <ExpenseBreakdown expenses={filteredExpenses} revenue={totals.revenue} period={period} loading={loading}/>
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Sales by
                service</h2>
                {/* The service names are known before the data is, so they stay put and only
                    the figure and its bar wait — the panel reads as itself while it fills in. */}
                <div aria-busy={loading} className="mt-6 space-y-5">{(Object.keys(SERVICES) as Service[]).map(service => {
                    const value = filtered.filter(s => s.service === service).reduce((sum, s) => sum + s.amount, 0);
                    const width = `${Math.min(100, (value / Math.max(1, totals.revenue)) * 100)}%`;
                    return <div key={service}>
                        <div className="mb-2 flex items-center justify-between text-sm"><span>{service}</span>{loading ?
                            <Skeleton className="h-4 w-16"/> : <b>{money(value)}</b>}
                        </div>
                        <div className="h-2 overflow-hidden rounded bg-slate-100">
                            {!loading && <div className="h-full rounded bg-blue-600" style={{width}}/>}
                        </div>
                    </div>;
                })}</div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Payment
                analysis</h2>
                <div aria-busy={loading} className="mt-6 space-y-4">{['Cash', 'Transfer', 'POS'].map(method => {
                    const value = filtered.filter(s => s.payment === method).reduce((sum, s) => sum + s.amount, 0);
                    return <div key={method} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <span>{method}</span>{loading ? <Skeleton className="h-4 w-20"/> : <b>{money(value)}</b>}</div>;
                })}</div>
            </section>
        </div>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="p-5"><h2 className="font-bold">Sales in selected period</h2></div>
            <SalesTable sales={slice} empty="No sales recorded in this period." loading={loading}
                        rows={5}/><Pagination {...pager}/></section>
    </>;
}
