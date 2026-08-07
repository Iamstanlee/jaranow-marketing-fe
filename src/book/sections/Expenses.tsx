import {useMemo, useState} from 'react';
import {Plus} from 'lucide-react';
import {dateOf, dayLabel, money, timeLabel} from '../format';
import {inRange, rangeKey, rangeLabel} from '../period';
import type {Expense, Role} from '../types';
import {usePage} from '../hooks/usePage';
import {useRange} from '../hooks/useRange';
import {ConfirmDelete} from '../components/ConfirmDelete';
import {ExpenseModal} from '../components/ExpenseModal';
import {Pagination} from '../components/Pagination';
import {PeriodFilter} from '../components/PeriodFilter';
import {RowActions} from '../components/RowActions';
import {Skeleton} from '../components/Skeleton';

export function Expenses({records, role, loading, onAdd, onUpdate, onDelete}: {
    records: Expense[];
    role: Role;
    loading: boolean;
    onAdd: () => void;
    onUpdate: (id: string, record: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
    onDelete?: (record: Expense) => Promise<void>
}) {
    // All time by default, for the same reason the sales ledger is — see Sales. Staff open on
    // today, again for the same reason.
    const [range, setRange] = useRange(role, 'All time');
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
                <div>{loading ? <><Skeleton className="h-6 w-28"/><Skeleton className="mt-2 h-3 w-36"/></> : <><h2
                    className="font-bold">{money(total)}</h2><p
                    className="text-xs text-slate-400">{filtered.length} expense{filtered.length === 1 ? '' : 's'} · {rangeLabel(range)}</p></>}
                </div>
                <PeriodFilter range={range} setRange={setRange} role={role} label="Filter expenses by date"/>
            </div>
            {loading ? <ul role="status" aria-busy aria-label="Loading expenses"
                           className="divide-y divide-slate-100">{[0, 1, 2, 3].map(i => <li key={i} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3"><Skeleton className="h-4 w-24"/><Skeleton
                    className="h-4 w-16"/></div>
                <Skeleton className="mt-2 h-3 w-40"/>
            </li>)}</ul> : !filtered.length ?
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
