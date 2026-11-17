import React, {useState} from 'react';
import {DUTIES, type Duty, OFF_DAYS, type OffDay} from '../constants';
import {isoDay} from '../format';
import {joinedAt, offCount, offDays, quietestDay} from '../roster';
import type {AttendantPay, Staff} from '../types';
import {Modal} from './Modal';

const TURN: Record<Duty, { label: string; hint: string }> = {
    Cleaning: {label: 'Cleaning weeks', hint: 'Takes a turn at cleaning, a week at a time.'},
    Off: {label: 'Weekly day off', hint: 'One day off every week, on a quiet day.'}
};

// A cashier is stored as the absence of `attendantPay`.
type Role = 'cashier' | 'attendant';

// null, not absent, so an edit can clear the field.
export type StaffRecord = Pick<Staff, 'name' | 'phone' | 'exempt' | 'offDay' | 'joinedOn'> & {
    attendantPay: AttendantPay | null;
    salary: number | null
};

export function StaffModal({person, staff, close, save}: {
    person?: Staff;
    staff: Staff[];
    close: () => void;
    save: (record: StaffRecord) => Promise<void>
}) {
    const [name, setName] = useState(person?.name || ''), [phone, setPhone] = useState(person?.phone || '');
    const [role, setRole] = useState<Role>(person?.attendantPay ? 'attendant' : 'cashier');
    const [chosenPay, setPay] = useState<AttendantPay>(person?.attendantPay ?? 'salary');
    const pay: AttendantPay = role === 'attendant' ? chosenPay : 'salary';
    const attendantPay = role === 'attendant' ? pay : null;
    const [joinedOn, setJoinedOn] = useState(() => isoDay(person && joinedAt(person) ? new Date(joinedAt(person)) : new Date()));
    const [salary, setSalary] = useState(person?.salary ? String(person.salary) : '');
    // Rotations they ARE in (what the boxes ask); inverted to `exempt` on save.
    const [turns, setTurns] = useState<Duty[]>(() => DUTIES.filter(d => !(person?.exempt || []).includes(d)));
    // Saving stores the day, so a leaver no longer re-spreads them.
    const [offDay, setOffDay] = useState<OffDay>(() =>
        offDays(staff).find(o => o.person.id === person?.id)?.day ?? quietestDay(staff, person));
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const toggle = (duty: Duty) => setTurns(list => list.includes(duty) ? list.filter(d => d !== duty) : [...list, duty]);
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({name: name.trim(), phone: phone.trim(), exempt: DUTIES.filter(d => !turns.includes(d)), offDay, joinedOn, attendantPay,
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
            <label className="block text-sm font-medium">Joined<input required type="date" value={joinedOn}
                                                                      onChange={e => setJoinedOn(e.target.value)}
                                                                      className="mt-1 w-full rounded-xl border-slate-200"/>
                <span className="mt-1 block text-xs font-normal text-slate-400">Salary and days off count from this day.</span></label>
            <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium">Role<select value={role}
                                                                        onChange={e => setRole(e.target.value as Role)}
                                                                        className="mt-1 w-full rounded-xl border-slate-200">
                    <option value="cashier">Cashier</option>
                    <option value="attendant">Carwash attendant</option>
                </select></label>
                <label className="block text-sm font-medium">Paid by<select value={pay}
                                                                           onChange={e => setPay(e.target.value as AttendantPay)}
                                                                           className="mt-1 w-full rounded-xl border-slate-200">
                    <option value="salary">Salary</option>
                    <option value="share" disabled={role !== 'attendant'}>Revenue share</option>
                </select></label>
            </div>
            {person && attendantPay !== (person.attendantPay ?? null) &&
                <p className="text-xs text-amber-600">This re-works every unpaid week. Pay out finished weeks first.</p>}
            {pay === 'salary' && <label className="block text-sm font-medium">Base salary per month (₦)
                <input inputMode="numeric" value={salary} onChange={e => setSalary(e.target.value.replace(/\D/g, ''))}
                       placeholder="e.g. 60000" className="mt-1 w-full rounded-xl border-slate-200"/>
            </label>}
            <fieldset className="rounded-xl border border-slate-200 p-3">
                <legend className="px-1 text-sm font-medium">In the rotation for</legend>
                <div className="space-y-3">{DUTIES.map(duty => <label key={duty}
                                                                      className="flex cursor-pointer items-start gap-3 text-sm">
                    <input type="checkbox" checked={turns.includes(duty)} onChange={() => toggle(duty)}
                           className="mt-0.5 rounded text-blue-600"/>
                    <span><span className="font-medium">{TURN[duty].label}</span><span
                        className="block text-xs text-slate-400">{TURN[duty].hint}</span></span>
                </label>)}</div>
                {turns.includes('Off') && <label className="mt-3 block text-sm font-medium">Day off<select value={offDay}
                    onChange={e => setOffDay(e.target.value as OffDay)} className="mt-1 w-full rounded-xl border-slate-200">
                    {OFF_DAYS.map(day => {
                        const others = offCount(staff, day, person);
                        return <option key={day} value={day}>{day}{others ? ` · ${others} other${others === 1 ? '' : 's'} off` : ''}</option>;
                    })}
                </select></label>}
                {!turns.length && <p className="mt-3 text-xs text-amber-600">No turns will fall to them, but they can still be swapped in.</p>}
            </fieldset>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting || !name.trim()}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : person ? 'Save changes' : 'Add to team'}</button>
        </form>
    </Modal>
}
