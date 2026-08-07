import React, {useState} from 'react';
import {DUTIES, type Duty} from '../constants';
import type {Staff} from '../types';
import {Modal} from './Modal';

// What each rotation is called when you are deciding whether somebody is in it. "Cleaning"
// and "Off" are the right words on a rota panel and the wrong ones on a checkbox, where the
// question is about turns rather than about this week.
const TURN: Record<Duty, { label: string; hint: string }> = {
    Cleaning: {label: 'Cleaning weeks', hint: 'Takes a turn at cleaning, a week at a time.'},
    Off: {label: 'Sundays off', hint: 'Takes a turn at having the Sunday off.'}
};

// Who is on the team. Deliberately thin — a name is what the rota needs, and a phone is what
// the person setting it needs when a duty has to change at short notice. Anything more
// (wages, hours, next of kin) is employment record-keeping, not a rota, and does not belong
// on a tablet left unlocked at the forecourt.
export function StaffModal({person, close, save}: {
    person?: Staff;
    close: () => void;
    save: (record: Pick<Staff, 'name' | 'phone' | 'exempt'>) => Promise<void>
}) {
    const [name, setName] = useState(person?.name || ''), [phone, setPhone] = useState(person?.phone || '');
    // Held as the set of rotations they ARE in, because that is the question the boxes ask —
    // a checkbox you tick to make something not happen is read wrong about half the time. It
    // is inverted back to the stored exemptions on save, which is the one place the two
    // meet. See the Staff type for why the stored shape is the exception.
    const [turns, setTurns] = useState<Duty[]>(() => DUTIES.filter(d => !(person?.exempt || []).includes(d)));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const toggle = (duty: Duty) => setTurns(list => list.includes(duty) ? list.filter(d => d !== duty) : [...list, duty]);
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({name: name.trim(), phone: phone.trim(), exempt: DUTIES.filter(d => !turns.includes(d))});
            close();
        } catch (err) {
            console.error('Failed to save team member', err);
            setError('Could not save this team member. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={person ? 'Edit team member' : 'Add a team member'} close={close}>
        <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-medium">Name<input required autoFocus={!person} value={name}
                                                                    onChange={e => setName(e.target.value)}
                                                                    placeholder="Full name"
                                                                    className="mt-1 w-full rounded-xl border-slate-200"/></label>
            <label className="block text-sm font-medium">Phone <span
                className="font-normal text-slate-400">(optional)</span><input inputMode="tel" value={phone}
                                                                              onChange={e => setPhone(e.target.value)}
                                                                              placeholder="Phone number"
                                                                              className="mt-1 w-full rounded-xl border-slate-200"/></label>
            {/* Both on by default: somebody added to the team takes every turn unless you say
                otherwise, which is what "on the team" ordinarily means. Unticking one takes
                them out of that turn order without taking them off the team, and without
                stopping them being swapped into a week by hand. */}
            <fieldset className="rounded-xl border border-slate-200 p-3">
                <legend className="px-1 text-sm font-medium">In the rotation for</legend>
                <div className="space-y-3">{DUTIES.map(duty => <label key={duty}
                                                                      className="flex cursor-pointer items-start gap-3 text-sm">
                    <input type="checkbox" checked={turns.includes(duty)} onChange={() => toggle(duty)}
                           className="mt-0.5 rounded text-blue-600"/>
                    <span><span className="font-medium">{TURN[duty].label}</span><span
                        className="block text-xs text-slate-400">{TURN[duty].hint}</span></span>
                </label>)}</div>
                {!turns.length && <p className="mt-3 text-xs text-amber-600">Exempt from both — they stay on the team
                    and can still be swapped into a week by hand, but no turn will ever fall to them.</p>}
            </fieldset>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting || !name.trim()}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : person ? 'Save changes' : 'Add to team'}</button>
        </form>
    </Modal>
}
