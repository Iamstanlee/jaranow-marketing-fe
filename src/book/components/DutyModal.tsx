import React, {useState} from 'react';
import {DUTIES, type Duty} from '../constants';
import {dayFrom} from '../format';
import {inRotation, slotLabel, slotOf} from '../roster';
import type {RosterEntry, Staff} from '../types';
import {Modal} from './Modal';

export function DutyModal({entry, day, duty: initialDuty, staffId: initialStaffId, staff, close, save, remove, removeLabel = 'Remove from duties'}: {
    entry?: RosterEntry;
    day: string;
    duty?: Duty;
    staffId?: string;
    staff: Staff[];
    close: () => void;
    save: (record: Omit<RosterEntry, 'id' | 'createdAt'>) => Promise<void>;
    remove?: () => Promise<void>;
    removeLabel?: string
}) {
    // Archived people are hidden, except the one already on this entry.
    const pickable = staff.filter(p => p.active || p.id === entry?.staffId);
    const [staffId, setStaffId] = useState(entry?.staffId || initialStaffId || pickable[0]?.id || '');
    const [duty, setDuty] = useState<Duty>(entry?.duty || initialDuty || 'Cleaning');
    // A plain date; the slot is derived from it and the duty.
    const [picked, setPicked] = useState(entry?.day || day);
    const [note, setNote] = useState(entry?.note || '');
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const person = pickable.find(p => p.id === staffId);
    const slot = slotOf(duty, dayFrom(picked));
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting || !person) return;
        setSubmitting(true);
        setError('');
        try {
            await save({day: slot, staffId: person.id, staffName: person.name, duty, note: note.trim()});
            close();
        } catch (err) {
            console.error('Failed to save duty', err);
            setError('Could not save this duty. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    const drop = async () => {
        if (submitting || !remove) return;
        setSubmitting(true);
        setError('');
        try {
            await remove();
            close();
        } catch (err) {
            console.error('Failed to remove duty', err);
            setError('Could not remove this duty. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={entry ? 'Edit duty' : 'Assign a duty'} close={close}>
        {!pickable.length
            ? <p className="text-sm leading-6 text-slate-500">Nobody on the team yet. Add a team member first.</p>
            : <form onSubmit={submit} className="space-y-4">
                <label className="block text-sm font-medium">Team member<select value={staffId}
                                                                                onChange={e => setStaffId(e.target.value)}
                                                                                className="mt-1 w-full rounded-xl border-slate-200">
                    {pickable.map(p => <option key={p.id}
                                               value={p.id}>{p.name}{!p.active ? ' (archived)' : inRotation(p, duty) ? '' : ' (exempt — swap only)'}</option>)}
                </select></label>
                <label className="block text-sm font-medium">Duty<select value={duty}
                                                                         onChange={e => setDuty(e.target.value as Duty)}
                                                                         className="mt-1 w-full rounded-xl border-slate-200">
                    {DUTIES.map(d => <option key={d}>{d}</option>)}
                </select>
                    {duty === 'Cleaning' && <span className="mt-1 block text-xs font-normal text-slate-400">Cleaning is set for a whole week, Monday to Sunday.</span>}
                </label>
                <label className="block text-sm font-medium">{duty === 'Off' ? 'Day off' : 'Week'}
                    <input required type="date" value={picked} onChange={e => setPicked(e.target.value)}
                           className="mt-1 w-full rounded-xl border-slate-200"/>
                    <span className="mt-1 block text-xs font-normal text-blue-600">{slotLabel(duty, slot)}</span></label>
                <label className="block text-sm font-medium">Note <span
                    className="font-normal text-slate-400">(optional)</span><input value={note}
                                                                                   onChange={e => setNote(e.target.value)}
                                                                                   placeholder={duty === 'Off' ? 'Why they are off' : 'Anything extra this week'}
                                                                                   className="mt-1 w-full rounded-xl border-slate-200"/></label>
                <p className="text-xs text-slate-400">{duty === 'Off'
                    ? 'Moves their day off for that week only. Other weeks keep their usual day.'
                    : 'A one-off swap. Every other week keeps taking turns.'}</p>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <button disabled={submitting}
                        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : entry ? 'Save changes' : 'Assign duty'}</button>
                {remove && <button type="button" onClick={drop} disabled={submitting}
                                   className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 disabled:opacity-60">{removeLabel}</button>}
            </form>}
    </Modal>
}
