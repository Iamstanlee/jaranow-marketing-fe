import {isoDay} from '../format';
import {CUSTOM, periodEnd, periodsFor, periodStart, type Range, rangeOf} from '../period';
import type {Role} from '../types';

export function PeriodFilter({range, setRange, role = 'admin', label = 'Date range'}: {
    range: Range;
    setRange: (r: Range) => void;
    role?: Role;
    label?: string
}) {
    const today = isoDay(new Date());
    const periods = periodsFor(role);
    // Switching to Custom seeds the dates from the preset you were on.
    const pick = (preset: string) => setRange(preset !== CUSTOM || range.preset === 'All time' ? rangeOf(preset) : {
        preset,
        from: isoDay(periodStart(range.preset)),
        to: isoDay(periodEnd(range.preset))
    });
    const field = 'rounded-xl border-slate-200 text-sm';
    return <div className="flex flex-wrap items-center gap-2">
        <select aria-label={label} value={range.preset} onChange={e => pick(e.target.value)} className={field}>
            {periods.map(p => <option key={p}>{p}</option>)}
            {role === 'admin' && <option value={CUSTOM}>{CUSTOM}…</option>}
        </select>
        {range.preset === CUSTOM && <>
            <input type="date" aria-label="From date" value={range.from} max={range.to || today}
                   onChange={e => setRange({...range, from: e.target.value})} className={field}/>
            <span className="text-sm text-slate-400">to</span>
            <input type="date" aria-label="To date" value={range.to} min={range.from} max={today}
                   onChange={e => setRange({...range, to: e.target.value})} className={field}/>
        </>}
    </div>;
}
