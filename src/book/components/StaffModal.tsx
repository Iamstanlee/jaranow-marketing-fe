import React, {useState} from 'react';
import {DUTIES, type Duty} from '../constants';
import type {AttendantPay, Staff} from '../types';
import {Modal} from './Modal';

// What each rotation is called when you are deciding whether somebody is in it. "Cleaning"
// and "Off" are the right words on a rota panel and the wrong ones on a checkbox, where the
// question is about turns rather than about this week.
const TURN: Record<Duty, { label: string; hint: string }> = {
    Cleaning: {label: 'Cleaning weeks', hint: 'Takes a turn at cleaning, a week at a time.'},
    Off: {label: 'Sundays off', hint: 'Takes a turn at having the Sunday off.'}
};

// Two questions in the form, one field in the record: `attendantPay` is set only for an
// attendant, so a cashier — always on salary — is stored as its absence.
type Role = 'cashier' | 'attendant';

// null, not absent, so an edit can clear the field.
export type StaffRecord = Pick<Staff, 'name' | 'phone' | 'exempt'> & {
    attendantPay: AttendantPay | null;
    salary: number | null
};

// Who is on the team. Deliberately thin: name, phone, and what Payments needs — the role and,
// for an attendant on salary, the base salary. This form is behind the admin PIN.
export function StaffModal({person, close, save}: {
    person?: Staff;
    close: () => void;
    save: (record: StaffRecord) => Promise<void>
}) {
    const [name, setName] = useState(person?.name || ''), [phone, setPhone] = useState(person?.phone || '');
    const [role, setRole] = useState<Role>(person?.attendantPay ? 'attendant' : 'cashier');
    const [chosenPay, setPay] = useState<AttendantPay>(person?.attendantPay ?? 'salary');
    // Revenue share is the attendants' pool, so a cashier is on salary whatever was last picked.
    const pay: AttendantPay = role === 'attendant' ? chosenPay : 'salary';
    const attendantPay = role === 'attendant' ? pay : null;
    const [salary, setSalary] = useState(person?.salary ? String(person.salary) : '');
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
            await save({name: name.trim(), phone: phone.trim(), exempt: DUTIES.filter(d => !turns.includes(d)), attendantPay,
                salary: pay === 'salary' ? Number(salary) || null : null
            });
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
            <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">Role<select value={role}
                                                                        onChange={e => setRole(e.target.value as Role)}
                                                                        className="mt-1 w-full rounded-xl border-slate-200">
                    <option value="cashier">Cashier</option>
                    <option value="attendant">Car Washer</option>
                </select></label>
                <label className="block text-sm font-medium">Paid by<select value={pay}
                                                                           onChange={e => setPay(e.target.value as AttendantPay)}
                                                                           className="mt-1 w-full rounded-xl border-slate-200">
                    <option value="salary">Salary</option>
                    <option value="share" disabled={role !== 'attendant'}>Revenue share</option>
                </select></label>
            </div>
            {person && attendantPay !== (person.attendantPay ?? null) &&
                <p className="text-xs text-amber-600">Changing this re-works every unpaid week, past ones included — pay
                    out a finished week first.</p>}
            {pay === 'salary' && <label className="block text-sm font-medium">Base salary per month (₦)
                <input inputMode="numeric" value={salary} onChange={e => setSalary(e.target.value.replace(/\D/g, ''))}
                       placeholder="e.g. 60000" className="mt-1 w-full rounded-xl border-slate-200"/>
            </label>}
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
