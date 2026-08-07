import React, {useState} from 'react';
import {DUTIES, type Duty} from '../constants';
import {dayFrom} from '../format';
import {inRotation, slotLabel, slotOf} from '../roster';
import type {RosterEntry, Staff} from '../types';
import {Modal} from './Modal';

// One person, one slot, one duty. Recording and correcting share this form for the same
// reason the expense form is shared: unlike a sale, nothing about a duty can only be set at
// the moment it is first written.
export function DutyModal({entry, day, duty: initialDuty, staffId: initialStaffId, staff, close, save, remove, removeLabel = 'Remove from rota'}: {
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
    // Archived people are off the picker — the rota is a plan for who turns up — except the
    // one this entry is already on, which would otherwise silently reassign itself to whoever
    // happens to head the list when the form opens.
    const pickable = staff.filter(p => p.active || p.id === entry?.staffId);
    // Opening on a slot the rotation already filled starts from whose turn it is, so a swap is
    // a change to one field rather than a form to fill in from scratch.
    const [staffId, setStaffId] = useState(entry?.staffId || initialStaffId || pickable[0]?.id || '');
    const [duty, setDuty] = useState<Duty>(entry?.duty || initialDuty || 'Cleaning');
    // The field holds a plain date; the SLOT is derived from it and the duty, so switching
    // Cleaning → Off after picking a date moves the entry from that week to that week's
    // Sunday rather than leaving it anchored to a Wednesday nothing happens on.
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
            // staffName is written alongside the id so the entry still reads after the person
            // is gone; see the RosterEntry type for why the live name is preferred at render.
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
            ? <p className="text-sm leading-6 text-slate-500">There is nobody on the team yet. Add a team member first,
                then come back to put them on the rota.</p>
            : <form onSubmit={submit} className="space-y-4">
                <label className="block text-sm font-medium">Team member<select value={staffId}
                                                                                onChange={e => setStaffId(e.target.value)}
                                                                                className="mt-1 w-full rounded-xl border-slate-200">
                    {/* Exempt people stay in the picker: an exemption keeps turns from falling
                        to somebody, it does not stop them covering a week when asked. Saying so
                        on the option is what makes picking one a decision rather than a slip. */}
                    {pickable.map(p => <option key={p.id}
                                               value={p.id}>{p.name}{!p.active ? ' (archived)' : inRotation(p, duty) ? '' : ' (exempt — swap only)'}</option>)}
                </select></label>
                <label className="block text-sm font-medium">Duty<select value={duty}
                                                                         onChange={e => setDuty(e.target.value as Duty)}
                                                                         className="mt-1 w-full rounded-xl border-slate-200">
                    {DUTIES.map(d => <option key={d}>{d}</option>)}
                </select>
                    <span className="mt-1 block text-xs font-normal text-slate-400">{duty === 'Off'
                        ? 'A day off is a Sunday — the bay trades the other six days.'
                        : 'Cleaning runs Monday to Sunday, so it is set for a whole week.'}</span>
                </label>
                {/* Any date in the slot will do. The caption says which slot it landed in, so a
                    mis-tapped Wednesday is visibly "week of 3 – 9 Aug" before it is saved
                    rather than a surprise on the rota afterwards. */}
                <label className="block text-sm font-medium">{duty === 'Off' ? 'Sunday' : 'Week'}
                    <input required type="date" value={picked} onChange={e => setPicked(e.target.value)}
                           className="mt-1 w-full rounded-xl border-slate-200"/>
                    <span className="mt-1 block text-xs font-normal text-blue-600">{slotLabel(duty, slot)}</span></label>
                <label className="block text-sm font-medium">Note <span
                    className="font-normal text-slate-400">(optional)</span><input value={note}
                                                                                   onChange={e => setNote(e.target.value)}
                                                                                   placeholder={duty === 'Off' ? 'Why they are off' : 'Anything extra this week'}
                                                                                   className="mt-1 w-full rounded-xl border-slate-200"/></label>
                {/* The rota fills this slot on its own, so what is being saved is an exception to
                    it. Saying so is the difference between "I am setting the rota" and "I am
                    overriding it this once", and only the second one is true. */}
                <p className="text-xs text-slate-400">This is a one-off swap for
                    the {duty === 'Off' ? 'Sunday' : 'week'} shown. Every other {duty === 'Off' ? 'Sunday' : 'week'} keeps
                    taking turns through the team on its own.</p>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                <button disabled={submitting}
                        className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : entry ? 'Save changes' : 'Assign duty'}</button>
                {remove && <button type="button" onClick={drop} disabled={submitting}
                                   className="w-full rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 disabled:opacity-60">{removeLabel}</button>}
            </form>}
    </Modal>
}
