import React, {useMemo, useState} from 'react';
import {MessageCircle, Phone, UserSearch} from 'lucide-react';
import {EXPERIENCE, NEARBY} from '../../data/hiring';
import {addDays, dateOf, dayFrom, dayLabel, isoDay} from '../format';
import type {Applicant, ApplicantStage} from '../types';
import {ConfirmDelete} from '../components/Confirm';
import {SELECT} from '../components/Fields';
import {Modal} from '../components/Modal';
import {Skeleton} from '../components/Skeleton';

type Patch = Partial<Pick<Applicant, 'stage' | 'trainingFrom' | 'notes'>>;

const STAGES: Array<{ id: ApplicantStage; label: string; empty: string }> = [
    {id: 'new', label: 'New', empty: 'No new applications. They arrive here from jaranow.com/careers.'},
    {id: 'training', label: 'Training', empty: 'Nobody booked for training.'},
    {id: 'bench', label: 'Bench', empty: 'Nobody on the bench. Good applicants without a slot yet go here.'},
    {id: 'hired', label: 'Hired', empty: 'Nobody hired from here yet.'},
    {id: 'declined', label: 'Declined', empty: 'No declined applications.'}
];

const tag = 'shrink-0 rounded px-2 py-0.5 text-[11px] font-medium';

const trainingDays = (from: string) => {
    const first = dayFrom(from);
    return `${dayLabel(first)} & ${dayLabel(addDays(first, 1))}`;
};

// 0803… → 234803…, for wa.me.
const international = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('234') ? digits : `234${digits.replace(/^0/, '')}`;
};

export function Hiring({applicants, loading, onUpdate, onHire, onRemove}: {
    applicants: Applicant[];
    loading: boolean;
    onUpdate: (applicant: Applicant, patch: Patch) => Promise<void>;
    onHire: (applicant: Applicant, salary: number | null) => Promise<void>;
    onRemove: (applicant: Applicant) => Promise<void>
}) {
    const [stage, setStage] = useState<ApplicantStage>('new');
    // An id, not the record, so the open modal follows live updates.
    const [openId, setOpenId] = useState<string | null>(null);
    const counts = useMemo(() => {
        const out = {new: 0, training: 0, bench: 0, hired: 0, declined: 0} as Record<ApplicantStage, number>;
        applicants.forEach(a => out[a.stage]++);
        return out;
    }, [applicants]);
    const shown = useMemo(() => {
        const list = applicants.filter(a => a.stage === stage);
        return stage === 'training' ? [...list].sort((a, b) => (a.trainingFrom || '').localeCompare(b.trainingFrom || '')) : list;
    }, [applicants, stage]);
    const open = applicants.find(a => a.id === openId);
    const current = STAGES.find(s => s.id === stage)!;

    return <>
        <p className="mb-7 max-w-xl text-sm text-slate-500">Applications from jaranow.com/careers, from first contact to the team.</p>

        <div role="tablist" aria-label="Stage" className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {STAGES.map(s => <button key={s.id} type="button" role="tab" aria-selected={stage === s.id}
                                     onClick={() => setStage(s.id)}
                                     className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${stage === s.id ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>
                {s.label}{!loading && <span className={`ml-2 tabular-nums ${stage === s.id ? 'text-slate-300' : 'text-slate-400'}`}>{counts[s.id]}</span>}
            </button>)}
        </div>

        <section aria-busy={loading} className="rounded-2xl border border-slate-200 bg-white">
            {loading ? <ul className="divide-y divide-slate-100">{[0, 1, 2].map(i => <li key={i} className="flex items-center gap-3 px-5 py-4">
                    <Skeleton className="h-9 w-9 rounded-full"/><div><Skeleton className="h-4 w-36"/><Skeleton className="mt-2 h-3 w-48"/></div></li>)}</ul>
                : !shown.length ? <div className="px-5 py-12 text-center">
                        <UserSearch className="mx-auto text-slate-300"/>
                        <p className="mt-3 text-sm text-slate-400">{current.empty}</p></div>
                    : <ul className="divide-y divide-slate-100">{shown.map(a => <li key={a.id}>
                        <button type="button" onClick={() => setOpenId(a.id)}
                                className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50">
                            <Avatar name={a.name}/>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{a.name}</p>
                                <p className="truncate text-sm text-slate-500">
                                    {a.stage === 'training' && a.trainingFrom ? `Training ${trainingDays(a.trainingFrom)}` : `${a.area} · ${a.start}`}
                                </p>
                            </div>
                            <div className="hidden shrink-0 flex-wrap justify-end gap-1.5 sm:flex">
                                <Tags applicant={a}/>
                            </div>
                            <span className="shrink-0 text-xs text-slate-400">{dayLabel(dateOf(a))}</span>
                        </button>
                    </li>)}</ul>}
        </section>

        {open && <ApplicantModal applicant={open} close={() => setOpenId(null)}
                                 onUpdate={onUpdate} onHire={onHire} onRemove={onRemove}/>}
    </>;
}

function Tags({applicant: a}: { applicant: Applicant }) {
    return <>
        {NEARBY.includes(a.area) && <span className={`${tag} bg-emerald-50 text-emerald-700`}>Close by</span>}
        {a.experience === EXPERIENCE[0] && <span className={`${tag} bg-blue-50 text-blue-700`}>Car wash experience</span>}
        {a.fullDay !== 'Yes' && <span className={`${tag} bg-amber-50 text-amber-700`}>Fewer days</span>}
    </>;
}

function Avatar({name}: { name: string }) {
    const letters = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
    return <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{letters || '?'}</span>;
}

type Mode = 'view' | 'training' | 'hire' | 'delete';

function ApplicantModal({applicant: a, close, onUpdate, onHire, onRemove}: {
    applicant: Applicant;
    close: () => void;
    onUpdate: (applicant: Applicant, patch: Patch) => Promise<void>;
    onHire: (applicant: Applicant, salary: number | null) => Promise<void>;
    onRemove: (applicant: Applicant) => Promise<void>
}) {
    const [mode, setMode] = useState<Mode>('view');
    const [from, setFrom] = useState(() => a.trainingFrom || isoDay(addDays(new Date(), 1)));
    const [salary, setSalary] = useState('');
    const [notes, setNotes] = useState(a.notes || '');
    const [busy, setBusy] = useState(false), [error, setError] = useState('');

    // Holds its own in-flight state so a slow tablet cannot be tapped into writing twice.
    const run = async (write: () => Promise<void>, after: 'close' | 'view' = 'close') => {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            await write();
            if (after === 'close') close(); else setMode('view');
        } catch (err) {
            console.error('Failed to update applicant', err);
            setError('Could not save this change. Please check your connection and try again.');
        } finally {
            setBusy(false);
        }
    };

    if (mode === 'delete') return <ConfirmDelete title={`Delete ${a.name}'s application?`}
                                                 detail="Their details are removed for good. A team member hired from it stays on the team."
                                                 close={() => setMode('view')} confirm={async () => {
        await onRemove(a);
        close();
    }}/>;

    const primary = 'flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60';
    const secondary = 'flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 disabled:opacity-60';
    const details: Array<[string, React.ReactNode]> = [
        ['Lives in', a.area],
        ['Can resume', a.start],
        ['Washed cars before', a.experience],
        ['Can work 5–6 days, 8am–7pm', a.fullDay],
        ['Heard about us', a.src ? `${a.source} · ${a.src} link` : a.source],
        ['Applied', dayLabel(dateOf(a))],
        ...(a.trainingFrom && a.stage !== 'new' ? [['Training', trainingDays(a.trainingFrom)] as [string, React.ReactNode]] : [])
    ];

    return <Modal title={a.name} close={close}>
        <div className="-mt-3 mb-5 flex flex-wrap gap-1.5"><Tags applicant={a}/></div>

        <div className="mb-5 flex gap-3">
            <a href={`tel:${a.phone.replace(/\s/g, '')}`} className={`${secondary} inline-flex items-center justify-center gap-2`}>
                <Phone size={16}/> {a.phone}</a>
            <a href={`https://wa.me/${international(a.phone)}`} target="_blank" rel="noopener noreferrer"
               aria-label={`WhatsApp ${a.name}`}
               className="grid w-12 place-items-center rounded-xl border border-slate-200 text-slate-600"><MessageCircle size={16}/></a>
        </div>

        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
            {details.map(([label, value]) => <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
            </div>)}
        </dl>

        <label className="mt-5 block text-sm font-medium">Notes
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                      placeholder="From the call or the training days"
                      className="mt-1 w-full rounded-xl border-slate-200 text-sm"/>
        </label>
        {notes !== (a.notes || '') && <button type="button" disabled={busy}
                                              onClick={() => run(() => onUpdate(a, {notes: notes.trim()}), 'view')}
                                              className="mt-2 text-sm font-semibold text-blue-600 disabled:opacity-60">Save notes</button>}

        {mode === 'training' && <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <label className="block text-sm font-medium">First training day
                <input type="date" value={from} min={isoDay(new Date())} onChange={e => setFrom(e.target.value)} className={SELECT}/>
            </label>
            <p className="mt-2 text-xs text-slate-400">Two days: {from ? trainingDays(from) : '—'}.</p>
            <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setMode('view')} className={secondary}>Cancel</button>
                <button type="button" disabled={busy || !from} className={primary}
                        onClick={() => run(() => onUpdate(a, {stage: 'training', trainingFrom: from}))}>{busy ? 'Saving…' : 'Book training'}</button>
            </div>
        </div>}

        {mode === 'hire' && <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <label className="block text-sm font-medium">Base salary per month (₦)
                <input inputMode="numeric" value={salary} autoFocus onChange={e => setSalary(e.target.value.replace(/\D/g, ''))}
                       placeholder="e.g. 60000" className={SELECT}/>
            </label>
            <p className="mt-2 text-xs text-slate-400">Added to the team as a car washer on salary. Change anything else from Staff.</p>
            <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setMode('view')} className={secondary}>Cancel</button>
                <button type="button" disabled={busy} className={primary}
                        onClick={() => run(() => onHire(a, Number(salary) || null))}>{busy ? 'Saving…' : 'Add to team'}</button>
            </div>
        </div>}

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

        {mode === 'view' && <div className="mt-6 space-y-3">
            {a.stage === 'training' && <button type="button" onClick={() => setMode('hire')} className={`${primary} w-full`}>Hire</button>}
            {(a.stage === 'new' || a.stage === 'bench') &&
                <button type="button" onClick={() => setMode('training')} className={`${primary} w-full`}>Book training</button>}
            {a.stage === 'declined' && <button type="button" disabled={busy} onClick={() => run(() => onUpdate(a, {stage: 'new'}))}
                                               className={`${secondary} w-full`}>Move back to new</button>}
            {a.stage !== 'hired' && a.stage !== 'declined' && <div className="flex gap-3">
                {a.stage === 'training' && <button type="button" onClick={() => setMode('training')} className={secondary}>Change dates</button>}
                {a.stage !== 'bench' && <button type="button" disabled={busy} onClick={() => run(() => onUpdate(a, {stage: 'bench'}))}
                                                className={secondary}>Bench</button>}
                <button type="button" disabled={busy} onClick={() => run(() => onUpdate(a, {stage: 'declined'}))}
                        className={secondary}>Decline</button>
            </div>}
            {a.stage === 'hired' && <p className="text-center text-sm text-slate-500">On the team. Manage them from Staff.</p>}
            <button type="button" onClick={() => setMode('delete')}
                    className="w-full pt-2 text-xs font-semibold text-slate-400 hover:text-red-600">Delete application</button>
        </div>}
    </Modal>;
}
