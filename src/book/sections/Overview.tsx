import {BarChart3, PiggyBank, Plus, WalletCards} from 'lucide-react';
import {money} from '../format';
import type {Totals} from '../totals';
import type {Expense, RosterEntry, Sale, Section, Staff} from '../types';
import {Stat} from '../components/Stat';
import {SalesTable} from '../components/SalesTable';
import {RosterSummary} from './Roster';

export function Overview({totals, sales, expenses, staff, roster, loading, rosterLoading, onSale, onChange}: {
    totals: Totals;
    sales: Sale[];
    expenses: Expense[];
    staff: Staff[];
    roster: RosterEntry[];
    loading: boolean;
    rosterLoading: boolean;
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
                                                                        note={`${totals.count} transactions`}
                                                                        loading={loading}/><Stat
            title="Today's expenses" value={money(spent)} icon={WalletCards} tint="bg-rose-50 text-rose-600"
            note={`${expenses.length} recorded today`} loading={loading}/><Stat title="Cash received"
                                                                               value={money(totals.cash)}
                                                                               icon={BarChart3}
                                                                               tint="bg-amber-50 text-amber-600"
                                                                               note="Ready to reconcile"
                                                                               loading={loading}/></div>
        {/* Who has cleaning and who is off on Sunday, on the one screen everybody opens first.
            The rota section is where it is set and walked week by week; this is the answer to
            "whose week is it", which is asked at the start of a shift. */}
        <RosterSummary staff={staff} roster={roster} loading={rosterLoading} onOpen={() => onChange('roster')}/>
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between p-5">
                <div><h2 className="font-bold">Recent sales</h2><p className="text-xs text-slate-400">Today’s records</p>
                </div>
                <button onClick={() => onChange('sales')} className="text-sm font-semibold text-blue-600">View all
                </button>
            </div>
            {/* Today only, like the figures above it. "View all" is the way to earlier days. */}
            <SalesTable sales={sales.slice(0, 5)} empty="No sales recorded today." loading={loading}/></section>
    </>
}
