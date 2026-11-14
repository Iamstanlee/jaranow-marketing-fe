import {type ReactNode, useMemo, useState} from 'react';
import {Check, ChevronLeft, ChevronRight, Pencil, Plus, UserPlus, Users, X} from 'lucide-react';
import {DUTIES, type Duty, LEFT_REASONS, type LeftReason} from '../constants';
import {addDays, dateText, isoDay, startOfDay, startOfWeek} from '../format';
import {ATTENDANCE_START, isAttendant, type Mark, markOn, presentOn} from '../payments';
import {nameOf, rotation, slotLabel, weekRoster, weekSpan, type Assignment} from '../roster';
import type {Attendance, Role, RosterEntry, Staff as Person} from '../types';
import {Confirm, ConfirmDelete} from '../components/Confirm';
import {SELECT} from '../components/Fields';
import {DutyModal} from '../components/DutyModal';
import {RowActions} from '../components/RowActions';
import {Skeleton} from '../components/Skeleton';
import {StaffModal, type StaffRecord} from '../components/StaffModal';
import {DUTY_STYLE, exemptionOf} from './Roster';

type Editing = { entry?: RosterEntry; day: string; duty?: Duty; staffId?: string };

export function Staff({staff, roster, attendance, role, loading, attendanceLoading, onSetMark, onAddStaff, onUpdateStaff, onArchiveStaff, onRestoreStaff, onRemoveStaff, onAssign, onUpdateDuty, onRemoveDuty}: {
    staff: Person[];
    roster: RosterEntry[];
    attendance: Attendance[];
    role: Role;
    loading: boolean;
    attendanceLoading: boolean;
    onSetMark: (day: string, person: Person, mark: Mark | null) => Promise<void>;
    onAddStaff: (record: StaffRecord) => Promise<void>;
    onUpdateStaff: (id: string, patch: Partial<StaffRecord>) => Promise<void>;
    onArchiveStaff: (person: Person, leftAt: string, leftReason: LeftReason) => Promise<void>;
    onRestoreStaff: (person: Person) => Promise<void>;
    onRemoveStaff: (person: Person) => Promise<void>;
    onAssign: (record: Omit<RosterEntry, 'id' | 'createdAt'>) => Promise<void>;
    onUpdateDuty: (id: string, record: Omit<RosterEntry, 'id' | 'createdAt'>) => Promise<void>;
    onRemoveDuty: (entry: RosterEntry) => Promise<void>
}) {
    const admin = role === 'admin';
    const [editing, setEditing] = useState<Editing | null>(null);
    const [person, setPerson] = useState<Person | 'new' | null>(null);
    const [removing, setRemoving] = useState<Person | null>(null);
    const [archiving, setArchiving] = useState<Person | null>(null);
    const cycling = DUTIES.some(d => rotation(staff, d).length > 0);
    const presentToday = presentOn(isoDay(new Date()), staff, attendance).map(p => p.id);

    return <>
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="max-w-xl text-sm text-slate-500">{admin
                ? 'Attendance, duties and the team.'
                : 'Mark who is in today and check the duty rota.'}</p>
            {admin && <div className="flex flex-wrap gap-3">
                <button onClick={() => setPerson('new')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                    <UserPlus size={18}/> Add team member
                </button>
                <button onClick={() => setEditing({day: isoDay(startOfWeek(new Date())), duty: 'Cleaning'})}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                    <Plus size={18}/> Swap a duty
                </button>
            </div>}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
            <AttendanceCard staff={staff} attendance={attendance} role={role}
                            loading={loading || attendanceLoading} onSet={onSetMark}/>
            <DutiesCard staff={staff} roster={roster} admin={admin} loading={loading} onEdit={setEditing}/>
        </div>

        <TeamCard staff={staff} presentToday={presentToday} admin={admin} loading={loading}
                  onEdit={setPerson} onRemove={setRemoving}
                  onToggleActive={p => p.active ? setArchiving(p) : onRestoreStaff(p)}/>

        {editing && <DutyModal entry={editing.entry} day={editing.day} duty={editing.duty} staffId={editing.staffId}
                               staff={staff} close={() => setEditing(null)}
                               save={record => editing.entry ? onUpdateDuty(editing.entry.id, record) : onAssign(record)}
                               remove={editing.entry && (() => onRemoveDuty(editing.entry!))}
                               removeLabel={cycling ? 'Undo swap — back to whose turn it is' : 'Remove from duties'}/>}
        {person && <StaffModal person={person === 'new' ? undefined : person} close={() => setPerson(null)}
                               save={record => person === 'new' ? onAddStaff(record) : onUpdateStaff(person.id, record)}/>}
        {archiving && <ArchiveModal person={archiving} close={() => setArchiving(null)}
                                    confirm={(leftAt, reason) => onArchiveStaff(archiving, leftAt, reason)}/>}
        {removing && <ConfirmDelete title={`Remove ${removing.name}?`}
                                    detail={`${removing.name} comes off the team and off every week they have a duty. Archive them instead to keep their name on the weeks they worked.`}
                                    close={() => setRemoving(null)} confirm={() => onRemoveStaff(removing)}/>}
    </>;
}

// `back` appears once you have paged away from now.
function CardHead({title, sub, aside, back, onBack, onPrev, onNext, prevDisabled, nextDisabled, unit}: {
    title: string;
    sub: string;
    aside?: ReactNode;
    back?: string;
    onBack: () => void;
    onPrev: () => void;
    onNext: () => void;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
    unit: string
}) {
    const step = 'grid h-8 w-8 place-items-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent';
    return <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
        <div className="min-w-0">
            <h2 className="flex items-baseline gap-2 font-bold">{title}{aside}</h2>
            <p className="truncate text-xs text-slate-400">{sub}</p>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
            <button type="button" aria-label={`Previous ${unit}`} onClick={onPrev} disabled={prevDisabled}
                    className={step}><ChevronLeft size={16}/></button>
            {back && <button type="button" onClick={onBack}
                             className="h-8 px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50">{back}</button>}
            <button type="button" aria-label={`Next ${unit}`} onClick={onNext} disabled={nextDisabled}
                    className={step}><ChevronRight size={16}/></button>
        </div>
    </div>;
}

// Staff mark today only; admin can correct past days. Nobody marks the future.
const MARKS: Record<Mark, { label: string; tone: string }> = {
    present: {label: 'Present', tone: 'text-emerald-700'},
    absent: {label: 'Absent', tone: 'text-red-600'},
    leave: {label: 'Paid leave', tone: 'text-blue-700'}
};
const UNMARKED = {label: 'Not marked', tone: 'text-slate-400'};

function AttendanceCard({staff, attendance, role, loading, onSet}: {
    staff: Person[];
    attendance: Attendance[];
    role: Role;
    loading: boolean;
    onSet: (day: string, person: Person, mark: Mark | null) => Promise<void>
}) {
    const today = startOfDay(new Date());
    const [date, setDate] = useState(today);
    const [saving, setSaving] = useState<string | null>(null);
    const day = isoDay(date), isToday = day === isoDay(today);
    const editable = isToday || (role === 'admin' && date >= ATTENDANCE_START && date < today);

    const attendants = staff.filter(isAttendant);
    const present = presentOn(day, staff, attendance).map(p => p.id);

    const set = async (person: Person, mark: Mark | null) => {
        setSaving(person.id);
        try {
            await onSet(day, person, mark);
        } finally {
            setSaving(null);
        }
    };

    const label = date.toLocaleDateString('en-NG', {weekday: 'long', day: 'numeric', month: 'long'});
    const counted = !loading && attendants.length > 0;
    return <section aria-busy={loading} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <CardHead title="Attendance" sub={isToday ? `Today · ${label}` : label}
                  aside={counted && <span className="text-xs font-semibold tabular-nums text-slate-400">
                      {present.length}/{attendants.length}</span>}
                  back={isToday ? undefined : 'Today'} onBack={() => setDate(today)} unit="day"
                  onPrev={() => setDate(addDays(date, -1))} prevDisabled={date <= ATTENDANCE_START}
                  onNext={() => setDate(addDays(date, 1))} nextDisabled={isToday}/>
        {counted && <div className="mx-5 mb-1 h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full rounded-full bg-emerald-500 transition-all"
                 style={{width: `${(present.length / attendants.length) * 100}%`}}/></div>}
        {!editable && !loading && <p className="px-5 pt-2 text-xs text-slate-400">
            {role === 'admin' ? 'Before attendance was kept — nothing to mark.' : 'View only — ask an admin to correct an earlier day.'}</p>}
        {loading ? <ul className="py-2">{[0, 1, 2].map(i => <li key={i} className="flex items-center gap-3 px-5 py-2.5">
                <Skeleton className="h-8 w-8 rounded-full"/><Skeleton className="h-4 w-36"/></li>)}</ul>
            : !attendants.length ? <p className="px-5 pb-8 pt-4 text-center text-sm text-slate-400">
                    No car washers set up yet. {role === 'admin' ? 'Edit a team member below and set their role to Car Washer.' : 'Ask an admin to set them up.'}</p>
                : <ul className="py-2">{attendants.map(p => {
                    const state = markOn(day, p.id, attendance);
                    const busy = saving === p.id;
                    // Paid leave moves salary, so only admin gives or removes it.
                    const canLeave = role === 'admin' && p.attendantPay === 'salary';
                    const locked = !editable || (state === 'leave' && !canLeave);
                    const look = state ? MARKS[state] : UNMARKED;
                    const round = 'grid h-9 w-9 place-items-center rounded-full border transition-colors disabled:cursor-default';
                    return <li key={p.id} className={`flex items-center gap-3 px-5 py-2.5 ${busy ? 'opacity-60' : ''}`}>
                        <Initials name={p.name} on={state === 'present'}/>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className={`text-xs font-medium ${look.tone}`}>{look.label}
                                {canLeave && !locked && state !== 'present' && <>
                                    <span className="text-slate-300"> · </span>
                                    <button type="button" disabled={busy} onClick={() => set(p, state === 'leave' ? 'absent' : 'leave')}
                                            className="font-semibold text-blue-700 underline-offset-2 hover:underline">
                                        {state === 'leave' ? 'Remove leave' : 'Make it paid leave'}</button>
                                </>}
                            </p>
                        </div>
                        {!locked && <div className="flex shrink-0 gap-2">
                            <button type="button" aria-label={state === 'present' ? `Unmark ${p.name}` : `Mark ${p.name} present`} aria-pressed={state === 'present'}
                                    disabled={busy} onClick={() => set(p, state === 'present' ? null : 'present')}
                                    className={`${round} ${state === 'present' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600'}`}>
                                <Check size={16} strokeWidth={3}/></button>
                            <button type="button" aria-label={state === 'absent' ? `Unmark ${p.name}` : `Mark ${p.name} absent`} aria-pressed={state === 'absent'}
                                    disabled={busy} onClick={() => set(p, state === 'absent' ? null : 'absent')}
                                    className={`${round} ${state === 'absent' ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600'}`}>
                                <X size={16} strokeWidth={3}/></button>
                        </div>}
                    </li>;
                })}</ul>}
    </section>;
}

function DutiesCard({staff, roster, admin, loading, onEdit}: {
    staff: Person[];
    roster: RosterEntry[];
    admin: boolean;
    loading: boolean;
    onEdit: (editing: Editing) => void
}) {
    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const {week, sunday, cleaning, off} = useMemo(() => weekRoster(roster, staff, weekStart), [roster, staff, weekStart]);
    const thisWeek = week === isoDay(startOfWeek(new Date()));
    const anyone = staff.some(p => p.active);

    // Admin taps a name to swap it; a derived turn opens the form pre-filled, a swap opens itself.
    const line = (kind: Duty, entries: Assignment[], anchor: string) => {
        const {tint, icon: Icon} = DUTY_STYLE[kind];
        return <li className="flex flex-1 gap-4 px-5 py-4">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tint}`}><Icon size={17}/></div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400"><span className="font-semibold text-slate-600">{kind === 'Off' ? 'Sunday off' : 'Cleaning'}</span>
                    {' · '}{kind === 'Off' ? slotLabel(kind, anchor) : 'All week'}</p>
                {loading ? <Skeleton className="mt-2 h-5 w-32"/>
                    : !entries.length ? <p className="mt-1 text-sm text-slate-400">{!anyone ? 'Nobody on the team yet.' : 'Everybody is exempt.'}
                            {admin && anyone && <button type="button" onClick={() => onEdit({day: anchor, duty: kind})}
                                                        className="ml-1 font-semibold text-blue-600">Swap someone in</button>}</p>
                        : <ul className="mt-1 space-y-0.5">{entries.map(entry => {
                            const name = nameOf(entry, staff);
                            const body = <>
                                <span className="truncate font-medium">{name}</span>
                                {!entry.auto && <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Swapped</span>}
                                {entry.note && <span className="truncate text-xs text-slate-400">{entry.note}</span>}
                                {admin && <Pencil size={13} className="ml-auto shrink-0 text-slate-300 group-hover:text-blue-600"/>}
                            </>;
                            return <li key={entry.id}>{admin
                                ? <button type="button" aria-label={`Change ${name} · ${kind}`}
                                          onClick={() => onEdit(entry.auto ? {day: entry.day, duty: entry.duty, staffId: entry.staffId} : {entry, day: entry.day})}
                                          className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-slate-50">{body}</button>
                                : <span className="flex items-center gap-2 py-1">{body}</span>}</li>;
                        })}</ul>}
            </div>
        </li>;
    };

    return <section aria-busy={loading} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <CardHead title="Duties" sub={`${thisWeek ? 'This week · ' : ''}${weekSpan(weekStart)}`}
                  back={thisWeek ? undefined : 'This week'} onBack={() => setWeekStart(startOfWeek(new Date()))}
                  unit="week" onPrev={() => setWeekStart(addDays(weekStart, -7))}
                  onNext={() => setWeekStart(addDays(weekStart, 7))}/>
        <ul className="flex flex-1 flex-col divide-y divide-slate-100 border-t border-slate-100">
            {line('Cleaning', cleaning, week)}
            {line('Off', off, sunday)}
        </ul>
    </section>;
}

function TeamCard({staff, presentToday, admin, loading, onEdit, onRemove, onToggleActive}: {
    staff: Person[];
    presentToday: string[];
    admin: boolean;
    loading: boolean;
    onEdit: (person: Person) => void;
    onRemove: (person: Person) => void;
    onToggleActive: (person: Person) => void
}) {
    const active = staff.filter(p => p.active), archived = staff.filter(p => !p.active);
    const tag = 'shrink-0 rounded px-2 py-0.5 text-[11px] font-medium';
    return <section aria-busy={loading} className="mt-5 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><Users/></div>
            <div><h2 className="font-bold">Team</h2>
                <p className="text-xs text-slate-400">{loading ? 'Loading…' : `${active.length} active${archived.length ? ` · ${archived.length} archived` : ''}`}</p>
            </div>
        </div>
        {loading ? <ul className="divide-y divide-slate-100">{[0, 1, 2].map(i => <li key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-8 w-8 rounded-full"/><div><Skeleton className="h-4 w-32"/><Skeleton className="mt-2 h-3 w-24"/></div></li>)}</ul>
            : !staff.length ? <p className="px-5 py-10 text-center text-sm text-slate-400">
                    Nobody on the team yet.</p>
                : <ul className="divide-y divide-slate-100">{[...active, ...archived].map(p => <li key={p.id}
                        className={`flex items-center justify-between gap-3 px-5 py-4 ${p.active ? '' : 'bg-slate-50/60'}`}>
                    <div className="flex min-w-0 items-center gap-3">
                        <Initials name={p.name} on={presentToday.includes(p.id)} muted={!p.active}/>
                        <div className="min-w-0">
                            <p className={`truncate font-medium ${p.active ? '' : 'text-slate-500'}`}>{p.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                                {!p.active && <span className={`${tag} bg-slate-200 text-slate-600`}>Archived</span>}
                                {!p.active && p.leftAt && <span className="text-xs text-slate-400">
                                    Left {dateText(p.leftAt)}{p.leftReason ? ` · ${p.leftReason}` : ''}</span>}
                                {p.active && <span className={`${tag} bg-blue-50 text-blue-700`}>
                                    {p.attendantPay ? 'Car Washer' : 'Cashier'}</span>}
                                {presentToday.includes(p.id) && <span className={`${tag} bg-emerald-50 text-emerald-700`}>In today</span>}
                                {p.active && exemptionOf(p) && <span className={`${tag} bg-amber-50 text-amber-700`}>{exemptionOf(p)}</span>}
                            </div>
                        </div>
                    </div>
                    {admin && <div className="flex shrink-0 items-center gap-3">
                        <button type="button" onClick={() => onToggleActive(p)}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-700">{p.active ? 'Archive' : 'Restore'}</button>
                        <RowActions label={p.name} onEdit={() => onEdit(p)} onDelete={() => onRemove(p)}/>
                    </div>}
                </li>)}</ul>}
    </section>;
}

// When and why they left is what tenure and retention are measured from.
function ArchiveModal({person, close, confirm}: {
    person: Person;
    close: () => void;
    confirm: (leftAt: string, reason: LeftReason) => Promise<void>
}) {
    const today = isoDay(new Date());
    const [leftAt, setLeftAt] = useState(today), [reason, setReason] = useState<LeftReason>('Resigned');
    return <Confirm title={`Archive ${person.name}?`} action="Archive"
                    detail="They come off attendance and the rota, and stay on the weeks they worked."
                    close={close} confirm={() => confirm(leftAt || today, reason)}>
        <div className="mt-5 grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium">Last day<input type="date" value={leftAt} max={today}
                                                                       onChange={e => setLeftAt(e.target.value)}
                                                                       className={SELECT}/></label>
            <label className="block text-sm font-medium">Reason<select value={reason}
                                                                      onChange={e => setReason(e.target.value as LeftReason)}
                                                                      className={SELECT}>
                {LEFT_REASONS.map(r => <option key={r}>{r}</option>)}
            </select></label>
        </div>
    </Confirm>;
}

function Initials({name, on, muted}: { name: string; on?: boolean; muted?: boolean }) {
    const letters = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    const tone = muted ? 'bg-slate-100 text-slate-400' : on ? 'bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : 'bg-slate-100 text-slate-600';
    return <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${tone}`}>{letters || '?'}</span>;
}
