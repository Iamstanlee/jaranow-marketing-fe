import React, {useMemo, useState} from 'react';
import {TrendingDown, TrendingUp} from 'lucide-react';
import {dateOf, dayFrom, endOfDay, isoDay, money, startOfDay, startOfMonth, startOfWeek} from '../format';
import {CUSTOM, periodEnd, periodStart, type Range, rangeLabel} from '../period';
import type {Sale} from '../types';
import {Skeleton} from '../components/Skeleton';

// --- Sales growth ------------------------------------------------------------------
// Buckets run across the WHOLE selected window and are then filled, so a day with no
// sales is a zero on the line rather than a missing point. Dropping empty days would
// draw a straight line across a quiet week and read as steady trading, which is the
// opposite of what happened.
// `weekday` is carried alongside `label` rather than derived at render: the bucket's own
// date is gone by then, and re-parsing `key` to get it back is how off-by-one timezone
// bugs get in.
type Bucket = { key: string; label: string; weekday: string; revenue: number; count: number };
type Unit = 'day' | 'week' | 'month';
// How the x-axis, tooltip and table name a bucket. Only meaningful on daily buckets — a
// month has no day of the week — so the toggle is hidden and this ignored otherwise.
type Naming = 'date' | 'weekday';
// What the growth panel plots. Cars counts every car through the bay, redemptions
// included; revenue counts what was taken. They are not the same shape of number, which
// is the whole reason they are two views rather than two lines.
type Measure = 'revenue' | 'cars';

// Axis ticks land on round money, not on the data's own maximum: ₦47,300 as the top
// gridline makes every other value harder to read off, not easier.
// The step list is deliberately fine-grained. A coarse one (1/2/5/10) sends a ₦28,000
// peak to a ₦50,000 ceiling, and the line then draws in the bottom half of the panel
// with the top half empty — the chart reads as a slump that is really just headroom.
const niceCeil = (value: number) => {
    if (value <= 0) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    return magnitude * (steps.find(step => value <= step * magnitude) ?? 10);
};
// Gutter labels only — the tooltip and the table carry exact figures.
const compactMoney = (value: number) => value >= 1_000_000 ? `₦${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}m`
    : value >= 1_000 ? `₦${Math.round(value / 1_000)}k` : `₦${Math.round(value)}`;

// The window the trend is drawn across. 'All time' has no start of its own, so it takes
// the first sale on record; every other preset uses the same start the filter used, which
// is what keeps the chart and the figures above it telling the same story.
function trendWindow(filtered: Sale[], range: Range) {
    const times = filtered.map(s => dateOf(s).getTime());
    const earliest = times.length ? startOfDay(new Date(Math.min(...times))) : null;
    const openStart = range.preset === 'All time' || (range.preset === CUSTOM && !range.from);
    const from = openStart ? earliest : range.preset === CUSTOM ? startOfDay(dayFrom(range.from)) : periodStart(range.preset);
    const to = range.preset === CUSTOM ? (range.to ? endOfDay(dayFrom(range.to)) : endOfDay(new Date()))
        : range.preset === 'All time' ? endOfDay(new Date()) : periodEnd(range.preset);
    // `bounded` is what decides whether a previous-period comparison is honest: there is
    // nothing before "All time", and an open-ended custom range has no length to shift by.
    return {from, to, bounded: !openStart};
}

function bucketRevenue(sales: Sale[], from: Date, to: Date) {
    const spanDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
    // Chosen so no period ever draws much more than ~50 points: past that the line is
    // noise on a tablet held at arm's length and the labels collide.
    const unit: Unit = spanDays <= 45 ? 'day' : spanDays <= 240 ? 'week' : 'month';
    const startOfBucket = (date: Date) => unit === 'day' ? startOfDay(date) : unit === 'week' ? startOfWeek(date) : startOfMonth(date);
    const labelOf = (date: Date) => unit === 'month' ? date.toLocaleDateString('en-NG', {month: 'short', year: 'numeric'})
        : `${unit === 'week' ? 'w/c ' : ''}${date.toLocaleDateString('en-NG', {day: 'numeric', month: 'short'})}`;

    const buckets: Bucket[] = [], index = new Map<string, Bucket>();
    for (let cursor = startOfBucket(from); cursor <= to && buckets.length < 400; cursor = (() => {
        const next = new Date(cursor);
        if (unit === 'day') next.setDate(next.getDate() + 1); else if (unit === 'week') next.setDate(next.getDate() + 7); else next.setMonth(next.getMonth() + 1);
        return next;
    })()) {
        const bucket: Bucket = {
            key: isoDay(cursor),
            label: labelOf(cursor),
            weekday: cursor.toLocaleDateString('en-NG', {weekday: 'short'}),
            revenue: 0,
            count: 0
        };
        buckets.push(bucket);
        index.set(bucket.key, bucket);
    }
    for (const sale of sales) {
        const bucket = index.get(isoDay(startOfBucket(dateOf(sale))));
        if (!bucket) continue;
        bucket.revenue += sale.amount;
        bucket.count += 1;
    }
    return {buckets, unit};
}

export function SalesTrend({sales, filtered, range, loading}: {
    sales: Sale[];
    filtered: Sale[];
    range: Range;
    loading: boolean
}) {
    const [hover, setHover] = useState<number | null>(null);
    // Revenue and cars are different scales, so they are never two lines on one panel —
    // a second y-axis is the fastest way to make a chart say whatever the reader wants.
    // One measure at a time, same buckets, same window, so the two views are comparable
    // by flipping between them.
    const [measure, setMeasure] = useState<Measure>('cars');
    // Dates answer "when was that peak", weekdays answer "which day of the week trades" —
    // the same buckets read for a different question, so it is a relabel, not a re-bucket.
    // Nothing is summed by weekday here: two Mondays stay two points.
    const [naming, setNaming] = useState<Naming>('date');
    const {from, to, bounded} = useMemo(() => trendWindow(filtered, range), [filtered, range]);
    const {buckets, unit} = useMemo(() => from ? bucketRevenue(filtered, from, to) : {
        buckets: [] as Bucket[],
        unit: 'day' as Unit
    }, [filtered, from, to]);

    // A free wash is a car through the bay, so it counts here even though it adds no
    // revenue — the same rule the "Cars per day" stat uses. That is exactly why the two
    // lines can diverge: a week of redemptions is cars up, revenue flat.
    const valueOf = (bucket: Bucket) => measure === 'revenue' ? bucket.revenue : bucket.count;
    const amountOf = (sale: Sale) => measure === 'revenue' ? sale.amount : 1;
    const format = (value: number) => measure === 'revenue' ? money(value) : `${value} car${value === 1 ? '' : 's'}`;
    const axisLabel = (value: number) => measure === 'revenue' ? compactMoney(value) : String(Math.round(value));
    // A weekly or monthly bucket keeps its date label whatever the toggle says, so a range
    // change that coarsens the buckets can never leave "Mon" standing for a whole month.
    const byWeekday = naming === 'weekday' && unit === 'day';
    const nameOf = (bucket: Bucket) => byWeekday ? bucket.weekday : bucket.label;

    // Growth is a comparison, and a single period is not one: the headline is this window
    // against the window of the same length immediately before it. Drawn from ALL sales,
    // not the filtered slice — the previous window is by definition outside the filter.
    const growth = useMemo(() => {
        if (!bounded || !from) return null;
        const span = to.getTime() - from.getTime();
        const previousFrom = new Date(from.getTime() - span - 1), previousTo = new Date(from.getTime() - 1);
        const previous = sales.reduce((sum, s) => {
            const at = dateOf(s);
            return at >= previousFrom && at <= previousTo ? sum + amountOf(s) : sum;
        }, 0);
        if (!previous) return null; // nothing to divide by; the chart still stands on its own
        const current = filtered.reduce((sum, s) => sum + amountOf(s), 0);
        return {pct: ((current - previous) / previous) * 100, previous, days: Math.max(1, Math.round(span / 86_400_000))};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sales, filtered, from, to, bounded, measure]);

    const peak = Math.max(...buckets.map(valueOf), 0);
    // Car counts are whole cars: a ceiling of 7 puts the middle gridline at 3.5, which is
    // not a number of cars. Rounding the top up to an even integer keeps every tick real.
    const top = measure === 'cars' ? Math.max(2, Math.ceil(peak / 2) * 2) : niceCeil(peak);
    const x = (i: number) => buckets.length < 2 ? 50 : (i / (buckets.length - 1)) * 100;
    const y = (value: number) => 100 - (value / top) * 100;
    const line = buckets.map((b, i) => `${i ? 'L' : 'M'}${x(i).toFixed(3)},${y(valueOf(b)).toFixed(3)}`).join(' ');
    const last = buckets.length - 1, active = hover === null ? last : hover, point = buckets[active];

    const move = (event: React.PointerEvent<HTMLDivElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - box.left) / Math.max(1, box.width);
        setHover(Math.min(buckets.length - 1, Math.max(0, Math.round(ratio * (buckets.length - 1)))));
    };
    const key = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        setHover(current => Math.min(buckets.length - 1, Math.max(0, (current === null ? last : current) + step)));
    };

    return <section aria-busy={loading} className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><TrendingUp/>
                </div>
                <div><h2 className="font-bold">Sales growth</h2><p
                    className="text-xs text-slate-400">{measure === 'revenue' ? 'Revenue' : 'Cars'} by {unit} · {rangeLabel(range)}</p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                {/* Two views of the same buckets. Kept beside the chart it scopes, not up
                    with the period filter: the filter scopes the whole report, this only
                    swaps what this one panel plots. */}
                <div role="group" aria-label="Chart measure" className="inline-flex rounded-xl bg-slate-100 p-1">
                    {([['cars', 'Cars'], ['revenue', 'Revenue']] as [Measure, string][]).map(([value, label]) =>
                        <button key={value} type="button" onClick={() => setMeasure(value)}
                                aria-pressed={measure === value}
                                className={`rounded-lg px-3 py-1 text-sm transition ${measure === value ? 'bg-white font-semibold shadow-sm' : 'text-slate-500'}`}>{label}</button>)}
                </div>
                {/* Hidden rather than disabled on weekly and monthly buckets: a control that
                    cannot do anything is worse than one that isn't there. */}
                {unit === 'day' && <div role="group" aria-label="Chart labels"
                                        className="inline-flex rounded-xl bg-slate-100 p-1">
                    {([['date', 'Date'], ['weekday', 'Day']] as [Naming, string][]).map(([value, label]) =>
                        <button key={value} type="button" onClick={() => setNaming(value)}
                                aria-pressed={naming === value}
                                className={`rounded-lg px-3 py-1 text-sm transition ${naming === value ? 'bg-white font-semibold shadow-sm' : 'text-slate-500'}`}>{label}</button>)}
                </div>}
                {/* Direction is never colour alone — the arrow and the signed figure carry it. */}
                {!loading && growth && <span
                    title={`Against the previous ${growth.days} day${growth.days === 1 ? '' : 's'} (${format(growth.previous)})`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${growth.pct >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {growth.pct >= 0 ? <TrendingUp size={15}/> : <TrendingDown size={15}/>}
                    {growth.pct >= 0 ? '+' : '−'}{Math.abs(growth.pct).toFixed(growth.pct !== 0 && Math.abs(growth.pct) < 10 ? 1 : 0)}%
                    <span className="font-medium text-slate-500">vs previous</span></span>}
            </div>
        </div>

        {loading ? <Skeleton className="mt-6 h-56 w-full"/>
            : buckets.length < 2 ? <p className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                {filtered.length ? 'Pick a longer period to see how trading is moving.' : 'No sales recorded in this period.'}</p>
                : <>
                    <div className="relative mt-6 pl-12">
                        <div className="relative h-56">
                            {/* Gridlines carry the values that aren't directly labelled, so they
                                stay — hairline, one step off the surface, never dashed. */}
                            {[1, 0.5, 0].map(fraction => <div key={fraction} style={{top: `${(1 - fraction) * 100}%`}}
                                                              className="absolute inset-x-0 border-t border-slate-100">
                                <span
                                    className="absolute -left-12 -top-2 w-11 text-right text-[11px] tabular-nums text-slate-400">{axisLabel(top * fraction)}</span>
                            </div>)}
                            {/* preserveAspectRatio="none" maps 0-100 onto the box at any width;
                                non-scaling-stroke is what keeps the line 2px once it does. */}
                            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none"
                                 className="absolute inset-0 h-full w-full">
                                <path d={`${line} L100,100 L0,100 Z`} fill="#2563eb" fillOpacity=".1"/>
                                <path d={line} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
                            </svg>
                            {/* Crosshair and dots are HTML: a circle inside a non-uniformly scaled
                                SVG comes out an ellipse. */}
                            {hover !== null && <div style={{left: `${x(hover)}%`}}
                                                    className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-slate-300"/>}
                            <div style={{left: `${x(active)}%`, top: `${y(valueOf(point))}%`}}
                                 className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 ring-2 ring-white"/>
                            {/* One direct label, on the endpoint. A number on every point is noise. */}
                            {hover === null && <span style={{left: `${x(last)}%`, top: `${y(valueOf(point))}%`}}
                                                     className="pointer-events-none absolute -translate-x-full -translate-y-[190%] whitespace-nowrap pr-2 text-xs font-semibold tabular-nums text-slate-700">{format(valueOf(point))}</span>}
                            <div tabIndex={0} onPointerMove={move} onPointerLeave={() => setHover(null)}
                                 onKeyDown={key} onBlur={() => setHover(null)}
                                 aria-label={`${measure === 'revenue' ? 'Revenue' : 'Cars'} by ${unit}. Use the left and right arrow keys to read each ${unit}.`}
                                 className="absolute inset-0 cursor-crosshair rounded outline-offset-2"/>
                            {/* The readout stays INSIDE the plot box. Floated above it, it
                                overlaps the card header and collides with the growth chip on
                                a narrow screen. It flips to the floor when the hovered point
                                sits high, so it never covers the value being read. */}
                            {hover !== null && <div
                                style={{
                                    left: `${Math.min(88, Math.max(12, x(hover)))}%`,
                                    ...(y(valueOf(point)) < 42 ? {bottom: '.5rem'} : {top: '.5rem'})
                                }}
                                className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-white shadow-lg">
                                <p className="text-sm font-bold tabular-nums">{format(valueOf(point))}</p>
                                {/* The secondary line carries the measure you are NOT looking at,
                                    so a spike answers "more cars or bigger jobs?" in one hover. */}
                                <p className="text-[11px] text-white/70">{nameOf(point)} · {measure === 'revenue'
                                    ? `${point.count} car${point.count === 1 ? '' : 's'}` : money(point.revenue)}</p>
                            </div>}
                        </div>
                        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                            <span>{nameOf(buckets[0])}</span>
                            {buckets.length > 2 && <span className="hidden sm:inline">{nameOf(buckets[Math.floor(last / 2)])}</span>}
                            <span>{nameOf(buckets[last])}</span>
                        </div>
                    </div>
                    {/* Every figure on the chart is reachable without a pointer. */}
                    <details className="mt-5 border-t border-slate-100 pt-3">
                        <summary className="cursor-pointer text-sm text-slate-500">View as table</summary>
                        <div className="mt-3 max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
                                <tr>
                                    <th className="py-1 font-medium">{unit === 'month' ? 'Month' : unit === 'week' ? 'Week' : 'Day'}</th>
                                    {/* The date stays in the table even in weekday view: rows repeat
                                        weekdays, so "Mon" alone names four different days. */}
                                    {byWeekday && <th className="py-1 font-medium">Date</th>}
                                    <th className="py-1 text-right font-medium">Cars</th>
                                    <th className="py-1 text-right font-medium">Revenue</th>
                                </tr>
                                </thead>
                                <tbody>{buckets.map(bucket => <tr key={bucket.key} className="border-t border-slate-50">
                                    <td className="py-1.5">{nameOf(bucket)}</td>
                                    {byWeekday && <td className="py-1.5 text-slate-500">{bucket.label}</td>}
                                    <td className="py-1.5 text-right tabular-nums text-slate-500">{bucket.count}</td>
                                    <td className="py-1.5 text-right font-medium tabular-nums">{money(bucket.revenue)}</td>
                                </tr>)}</tbody>
                            </table>
                        </div>
                    </details>
                </>}
    </section>;
}
