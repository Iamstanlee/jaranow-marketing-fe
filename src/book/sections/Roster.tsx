import {useMemo, useState} from 'react';
import {BroomSparkles, CalendarDays, ChevronLeft, ChevronRight, Parasol, Plus, UserPlus, Users} from 'lucide-react';
import {DUTIES, type Duty} from '../constants';
import {addDays, isoDay, startOfWeek} from '../format';
import {type Assignment, nameOf, rotation, slotLabel, sundayOf, weekRoster, weekSpan} from '../roster';
import type {Role, RosterEntry, Staff} from '../types';
import {ConfirmDelete} from '../components/ConfirmDelete';
import {DutyModal} from '../components/DutyModal';
import {RowActions} from '../components/RowActions';
import {Skeleton} from '../components/Skeleton';
import {StaffModal} from '../components/StaffModal';

// How each duty reads. Never colour alone: the icon and the word carry the difference, so a
// panel photographed and sent on WhatsApp still says which is which.
const DUTY_STYLE: Record<Duty, { chip: string; tint: string; icon: typeof BroomSparkles }> = {
    Cleaning: {chip: 'bg-blue-50 text-blue-900 border-blue-100', tint: 'bg-blue-50 text-blue-600', icon: BroomSparkles},
    Off: {chip: 'bg-amber-50 text-amber-900 border-amber-100', tint: 'bg-amber-50 text-amber-600', icon: Parasol}
};
const STEP = 'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500';

// How a person's exemptions read in the team list. Empty for somebody who takes every turn,
// which is most people — a line saying "in both rotations" against every name is noise.
const exemptionOf = (person: Staff) => {
    const out = person.exempt || [];
    if (!out.length) return '';
    if (out.length >= DUTIES.length) return 'Not in either rotation';
    return out[0] === 'Off' ? 'No Sunday-off turns' : 'No cleaning turns';
};

export function Roster({staff, roster, role, loading, onAddStaff, onUpdateStaff, onRemoveStaff, onAssign, onUpdateDuty, onRemoveDuty}: {
    staff: Staff[];
    roster: RosterEntry[];
    role: Role;
    loading: boolean;
    onAddStaff: (record: Pick<Staff, 'name' | 'phone'>) => Promise<void>;
    onUpdateStaff: (id: string, patch: Partial<Pick<Staff, 'name' | 'phone' | 'active'>>) => Promise<void>;
    onRemoveStaff: (person: Staff) => Promise<void>;
    onAssign: (record: Omit<RosterEntry, 'id' | 'createdAt'>) => Promise<void>;
    onUpdateDuty: (id: string, record: Omit<RosterEntry, 'id' | 'createdAt'>) => Promise<void>;
    onRemoveDuty: (entry: RosterEntry) => Promise<void>
}) {
    const admin = role === 'admin';
    // The week is the unit a rota is planned and read in — cleaning IS a week, and the day off
    // is that week's Sunday — so the whole section is one week at a time. Both roles can walk
    // it in either direction: knowing which Sunday you are off is the point of a rota, and
    // unlike the takings there is nothing here a member of staff should not see.
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [editing, setEditing] = useState<{
        entry?: RosterEntry;
        day: string;
        duty?: Duty;
        staffId?: string
    } | null>(null);
    const [person, setPerson] = useState<Staff | 'new' | null>(null);
    const [removing, setRemoving] = useState<Staff | null>(null);

    const {week, sunday, cleaning, off} = useMemo(() => weekRoster(roster, staff, weekStart), [roster, staff, weekStart]);
    const thisWeek = week === isoDay(startOfWeek(new Date()));
    const active = staff.filter(p => p.active), archived = staff.filter(p => !p.active);
    // Nothing to rotate through means every slot is empty, and the fix is a team member or an
    // exemption rather than an assignment — so the panels say which of the two it is instead
    // of "nobody on cleaning". Checked per duty, because exemptions are per duty: a team can
    // have a cleaning rotation and no Sunday-off rotation at all.
    const cycling = DUTIES.some(d => rotation(staff, d).length > 0);

    // Both panels are the same block with a different duty in it, and the duty decides its
    // anchor date, its wording and what "empty" means. Assigning from a panel opens the form
    // already on that duty — arriving on the Off panel and being handed a cleaning form is the
    // kind of small wrongness that gets a week assigned to the wrong slot.
    const panel = (kind: Duty, entries: Assignment[], anchor: string) => {
        const {tint, icon: Icon} = DUTY_STYLE[kind];
        return <section className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={19}/>
                    </div>
                    <div><h3 className="font-bold">{kind === 'Off' ? 'Off' : 'Cleaning'}</h3><p
                        className="text-xs first-letter:uppercase text-slate-400">{slotLabel(kind, anchor)}</p></div>
                </div>
                {admin && <button type="button" onClick={() => setEditing({day: anchor, duty: kind})}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                    <Plus size={14}/> Swap</button>}
            </div>
            {loading ? <div className="mt-4 space-y-2"><Skeleton className="h-11 w-full"/><Skeleton
                className="h-11 w-2/3"/></div>
                : !entries.length ? <p className="mt-4 text-sm text-slate-400">{!active.length
                        ? 'Nobody on the team yet — the rota fills itself once somebody is on it.'
                        : `Everybody is exempt from the ${kind === 'Off' ? 'Sunday-off' : 'cleaning'} rotation, so no turn falls here. Swap somebody in, or put one of them back in the rotation.`}</p>
                    : <ul className="mt-4 space-y-2">{entries.map(entry => <li key={entry.id}>
                        <DutyRow entry={entry} staff={staff}
                            // A turn has no stored row to edit, so tapping it opens the form on
                            // whose turn it is — saving writes the swap that replaces it.
                                 onEdit={admin ? () => setEditing(entry.auto
                                     ? {day: entry.day, duty: entry.duty, staffId: entry.staffId}
                                     : {entry, day: entry.day}) : undefined}/></li>)}</ul>}
        </section>;
    };

    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">{admin
                ? 'Cleaning and the Sunday off take turns through the team automatically. Swap a week when you need to.'
                : 'Cleaning and the Sunday off take turns through the team. Look ahead to find your week.'}</p>
            {admin && <div className="flex flex-wrap gap-3">
                <button onClick={() => setPerson('new')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                    <UserPlus size={18}/> Add team member
                </button>
                <button onClick={() => setEditing({day: week, duty: 'Cleaning'})}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                    <Plus size={18}/> Swap a duty
                </button>
            </div>}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <CalendarDays/></div>
                    <div><h2 className="font-bold">{thisWeek ? 'This week' : 'Week of'}</h2><p
                        className="text-xs text-slate-400">{weekSpan(weekStart)}</p></div>
                </div>
                <div className="flex items-center gap-2">
                    {/* "This week" is the way back from wherever the arrows left you — without it,
                        finding the current week again after paging into next month is a count. */}
                    {!thisWeek && <button type="button" onClick={() => setWeekStart(startOfWeek(new Date()))}
                                          className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600">This
                        week</button>}
                    <button type="button" aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}
                            className={STEP}><ChevronLeft size={17}/></button>
                    <button type="button" aria-label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}
                            className={STEP}><ChevronRight size={17}/></button>
                </div>
            </div>
            {/* Two panels, not seven day cards. A day grid was the first cut and it misread the
                rota: cleaning is not a duty on a day, it is the whole week, and the only day
                that varies is the Sunday somebody has off. Drawing seven squares invited
                exactly the per-day assignment the business does not do.

                Every week has an answer already, including weeks nobody has opened yet, so
                these panels are never blank while there is a team — walking forward is how you
                find out when your turn is, not a list of gaps waiting to be filled in. */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {panel('Cleaning', cleaning, week)}
                {panel('Off', off, sunday)}
            </div>
        </section>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Users/></div>
                <div><h2 className="font-bold">Team</h2><p
                    className="text-xs text-slate-400">{active.length} on the rota{archived.length ? ` · ${archived.length} archived` : ''}</p>
                </div>
            </div>
            {loading ? <ul role="status" aria-busy aria-label="Loading team"
                           className="divide-y divide-slate-100">{[0, 1, 2].map(i => <li key={i} className="px-5 py-4">
                    <Skeleton className="h-4 w-32"/><Skeleton className="mt-2 h-3 w-24"/></li>)}</ul>
                : !staff.length ? <p className="px-5 py-10 text-center text-sm text-slate-400">
                        {admin ? 'Nobody on the team yet. Add someone to start the rota.' : 'Nobody on the team yet.'}</p>
                    : <ul className="divide-y divide-slate-100">{[...active, ...archived].map(p => <li key={p.id}
                                                                                                       className="flex items-center justify-between gap-3 px-5 py-4">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 truncate font-medium">{p.name}{!p.active && <span
                                className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-normal text-slate-500">Archived</span>}
                            </p>
                            {/* Says why somebody's name never comes up. Without it an exemption is
                                indistinguishable from a rota that has quietly stopped working. */}
                            <p className="mt-0.5 truncate text-sm text-slate-500">{p.phone || '—'}{exemptionOf(p) &&
                                <span className="text-amber-600"> · {exemptionOf(p)}</span>}</p>
                        </div>
                        {admin && <div className="flex shrink-0 items-center gap-3">
                            {/* Archiving is the ordinary way somebody leaves the rota: it takes them
                                out of the picker without taking their name off the weeks they
                                worked. Deleting is for a row typed in by mistake, and says so by
                                being the one that asks first. */}
                            <button type="button" onClick={() => onUpdateStaff(p.id, {active: !p.active})}
                                    className="text-xs font-semibold text-slate-500">{p.active ? 'Archive' : 'Restore'}</button>
                            <RowActions label={p.name} onEdit={() => setPerson(p)} onDelete={() => setRemoving(p)}/>
                        </div>}
                    </li>)}</ul>}
        </section>

        {/* Removing a swap does not empty the slot — it hands it back to the rotation, which
            always has an answer for it — so the button says that rather than "remove". */}
        {editing && <DutyModal entry={editing.entry} day={editing.day} duty={editing.duty} staffId={editing.staffId}
                               staff={staff} close={() => setEditing(null)}
                               save={record => editing.entry ? onUpdateDuty(editing.entry.id, record) : onAssign(record)}
                               remove={editing.entry && (() => onRemoveDuty(editing.entry!))}
                               removeLabel={cycling ? 'Undo swap — back to whose turn it is' : 'Remove from rota'}/>}
        {person && <StaffModal person={person === 'new' ? undefined : person} close={() => setPerson(null)}
                               save={record => person === 'new' ? onAddStaff(record) : onUpdateStaff(person.id, record)}/>}
        {removing && <ConfirmDelete title={`Remove ${removing.name}?`}
                                    detail={`${removing.name} comes off the team and off every week they are on the rota. Archive them instead to keep their name on the weeks they worked.`}
                                    close={() => setRemoving(null)} confirm={() => onRemoveStaff(removing)}/>}
    </>;
}

// The whole row is the control for admin — tapping the thing you want to change is what a
// touchscreen expects, and a pair of icon buttons beside every name is a lot of target for a
// list this short. Staff get the same row as plain text.
//
// The badge says where the name came from. Without it a swapped week and a week that simply
// came round are indistinguishable, and the difference matters: one survives a change to the
// team and the other are recomputed from it.
function DutyRow({entry, staff, onEdit}: { entry: Assignment; staff: Staff[]; onEdit?: () => void }) {
    const {chip} = DUTY_STYLE[entry.duty];
    const label = nameOf(entry, staff);
    const body = <>
        <span className="min-w-0"><span className="block truncate font-medium">{label}</span>
            {entry.note && <span className="mt-0.5 block truncate text-xs opacity-75">{entry.note}</span>}</span>
        <span
            className="ml-auto shrink-0 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">{entry.auto ? 'Their turn' : 'Swapped'}</span>
    </>;
    const className = `flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm ${chip}`;
    return onEdit
        ? <button type="button" onClick={onEdit} aria-label={`Change ${label} · ${entry.duty}`}
                  className={className}>{body}</button>
        : <span className={className}>{body}</span>;
}

// The Overview strip. This week only, and read-only whoever is looking — the week walking and
// the editing live in the section above. It answers "who has cleaning" on the screen
// everybody opens first, which is where the question is actually asked.
export function RosterSummary({staff, roster, loading, onOpen}: {
    staff: Staff[];
    roster: RosterEntry[];
    loading: boolean;
    onOpen: () => void
}) {
    const monday = startOfWeek(new Date());
    const {cleaning, off} = useMemo(() => weekRoster(roster, staff, monday), [roster, staff, monday]);
    const line = (duty: Duty, entries: RosterEntry[]) => {
        const {tint, icon: Icon} = DUTY_STYLE[duty];
        return <div className="flex items-center gap-3">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={17}/></div>
            <div className="min-w-0"><p
                className="text-xs text-slate-400">{duty === 'Off' ? `Off · ${sundayOf(monday).toLocaleDateString('en-NG', {
                weekday: 'long',
                day: 'numeric',
                month: 'short'
            })}` : 'Cleaning · all week'}</p>
                {loading ? <Skeleton className="mt-1.5 h-4 w-28"/> : <p
                    className="truncate font-medium">{entries.length ? entries.map(e => nameOf(e, staff)).join(', ')
                    : <span className="font-normal text-slate-400">Nobody on the team</span>}</p>}</div>
        </div>;
    };
    return <section aria-busy={loading} className="mt-7 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between p-5">
            <div><h2 className="font-bold">This week’s rota</h2><p
                className="text-xs text-slate-400">{weekSpan(monday)}</p></div>
            <button onClick={onOpen} className="text-sm font-semibold text-blue-600">View rota</button>
        </div>
        <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2">
            {line('Cleaning', cleaning)}
            {line('Off', off)}
        </div>
    </section>;
}
