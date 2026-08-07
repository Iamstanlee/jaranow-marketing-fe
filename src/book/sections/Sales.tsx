import {useMemo, useState} from 'react';
import {Plus} from 'lucide-react';
import {dateOf, dayLabel, money, timeLabel} from '../format';
import {inRange, rangeKey, rangeLabel} from '../period';
import type {Role, Sale} from '../types';
import {usePage} from '../hooks/usePage';
import {useRange} from '../hooks/useRange';
import {ConfirmDelete} from '../components/ConfirmDelete';
import {Pagination} from '../components/Pagination';
import {PeriodFilter} from '../components/PeriodFilter';
import {SalesTable} from '../components/SalesTable';
import {Skeleton} from '../components/Skeleton';
import {EditSaleModal} from '../components/SaleModal';

export function Sales({sales, role, loading, onSale, onUpdate, onDelete}: {
    sales: Sale[];
    role: Role;
    loading: boolean;
    onSale: () => void;
    onUpdate: (id: string, patch: Pick<Sale, 'service' | 'payment' | 'amount'>) => Promise<void>;
    onDelete?: (s: Sale) => Promise<void>
}) {
    // All time by default: this is the ledger, and a section that silently hid last week's
    // sales behind a default filter would read as records having gone missing. Staff, who
    // cannot filter past yesterday at all, open on today instead.
    const [range, setRange] = useRange(role, 'All time');
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
                <div>{loading ? <><Skeleton className="h-6 w-28"/><Skeleton className="mt-2 h-3 w-36"/></> : <><h2
                    className="font-bold">{money(total)}</h2><p
                    className="text-xs text-slate-400">{filtered.length} sale{filtered.length === 1 ? '' : 's'} · {rangeLabel(range)}</p></>}
                </div>
                <PeriodFilter range={range} setRange={setRange} role={role} label="Filter sales by date"/>
            </div>
            <SalesTable sales={slice} empty="No sales in this date range." loading={loading} rows={5}
                        onEdit={setEditing}
                        onDelete={onDelete && setDeleting}/><Pagination {...pager}/></section>
        {editing && <EditSaleModal sale={editing} close={() => setEditing(null)} save={onUpdate}/>}
        {deleting && onDelete && <ConfirmDelete title="Delete this sale?"
                                                detail={`${deleting.service} · ${money(deleting.amount)} · ${dayLabel(dateOf(deleting))} at ${timeLabel(dateOf(deleting))}. This cannot be undone${deleting.loyaltyCode !== '—' ? `, and ${deleting.loyaltyCode} ${deleting.redeemed ? 'gets its 5 points back' : 'loses the point it earned'}` : ''}.`}
                                                close={() => setDeleting(null)}
                                                confirm={() => onDelete(deleting)}/>}
    </>
}
