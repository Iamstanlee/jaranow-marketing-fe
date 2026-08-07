import {CircleDollarSign} from 'lucide-react';
import {Skeleton} from './Skeleton';

export function Stat({title, value, icon: Icon, tint, note, loading = false}: {
    title: string;
    value: string;
    icon: typeof CircleDollarSign;
    tint: string;
    note: string;
    loading?: boolean
}) {
    // The title and the icon stay: they say what the card will hold, so the row reads as
    // itself while it fills in rather than as three anonymous grey boxes.
    return <section aria-busy={loading} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-500">{title}</p>
            <div className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon size={19}/></div>
        </div>
        {loading ? <><Skeleton className="mt-5 h-8 w-28"/><Skeleton className="mt-2 h-3 w-20"/></> : <>
            <p className="mt-5 text-2xl font-bold tracking-tight">{value}</p><p
            className="mt-1 text-xs text-slate-400">{note}</p></>}</section>
}
