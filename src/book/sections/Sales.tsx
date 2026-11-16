import {useMemo, useState} from 'react';
import {Plus} from 'lucide-react';
import {dateOf, dayLabel, money, timeLabel} from '../format';
import {rangeKey, rangeLabel, rangeTest} from '../period';
import type {Role, Sale, SalePatch} from '../types';
import {useHistory} from '../hooks/useHistory';
import {usePage} from '../hooks/usePage';
import {useRange} from '../hooks/useRange';
import {ConfirmDelete} from '../components/Confirm';
import {RugBalances} from '../components/RugBalances';
import {Pagination} from '../components/Pagination';
import {PeriodFilter} from '../components/PeriodFilter';
import {SalesTable} from '../components/SalesTable';
import {Skeleton} from '../components/Skeleton';
import {EditSaleModal} from '../components/SaleModal';

export function Sales({sales, owing, owingLoading, role, loading, requestHistory, historyLoading, onSale, onUpdate, onCollect, onDelete}: {
    sales: Sale[];
    owing: Sale[];
    owingLoading: boolean;
    role: Role;
    loading: boolean;
    requestHistory: (from: number) => void;
    historyLoading: boolean;
    onSale: () => void;
    onUpdate: (id: string, patch: SalePatch) => Promise<void>;
    onCollect: (s: Sale, payment: string) => Promise<void>;
    onDelete?: (s: Sale) => Promise<void>
}) {
    // All time, so nothing looks missing; staff fall back to Today. Opening this pulls history.
    const [range, setRange] = useRange(role, 'All time');
    useHistory(range, requestHistory);
    const pending = loading || historyLoading;
    const [editing, setEditing] = useState<Sale | null>(null), [deleting, setDeleting] = useState<Sale | null>(null);
    const filtered = useMemo(() => {
        const within = rangeTest(range);
        return sales.filter(s => within(dateOf(s)));
    }, [sales, range]);
    const total = useMemo(() => filtered.reduce((sum, s) => sum + s.amount, 0), [filtered]);
    const {slice, ...pager} = usePage(filtered, rangeKey(range));
    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><p
            className="text-sm text-slate-500">Every sale, newest first.</p>
            <button onClick={onSale}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                <Plus size={18}/> Record sale
            </button>
        </div>
        <RugBalances owing={owing} loading={owingLoading} onCollect={onCollect} className="mb-7"/>
        <section className="rounded-2xl border border-slate-200 bg-white">
            <div
                className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>{pending ? <><Skeleton className="h-6 w-28"/><Skeleton className="mt-2 h-3 w-36"/></> : <><h2
                    className="font-bold">{money(total)}</h2><p
                    className="text-xs text-slate-400">{filtered.length} sale{filtered.length === 1 ? '' : 's'} · {rangeLabel(range)}</p></>}
                </div>
                <PeriodFilter range={range} setRange={setRange} role={role} label="Filter sales by date"/>
            </div>
            <SalesTable sales={slice} empty="No sales in this date range." loading={pending} rows={5}
                        onEdit={setEditing}
                        onDelete={onDelete && setDeleting}/><Pagination {...pager}/></section>
        {editing && <EditSaleModal sale={editing} close={() => setEditing(null)} save={onUpdate}/>}
        {deleting && onDelete && <ConfirmDelete title="Delete this sale?"
                                                detail={`${deleting.service} · ${money(deleting.amount)} · ${dayLabel(dateOf(deleting))} at ${timeLabel(dateOf(deleting))}. This cannot be undone${deleting.balanceOf ? `, and the rug goes back to ${money(deleting.amount)} due` : deleting.balance ? `, and the ${money(deleting.balance)} still due is dropped with it` : ''}${deleting.loyaltyCode !== '—' ? `, and ${deleting.loyaltyCode} ${deleting.redeemed ? 'gets its 5 points back' : 'loses the point it earned'}` : ''}.`}
                                                close={() => setDeleting(null)}
                                                confirm={() => onDelete(deleting)}/>}
    </>
}
