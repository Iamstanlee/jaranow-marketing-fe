import React, {useState} from 'react';
import type {Expense} from '../types';
import {Modal} from './Modal';

// One form for recording and correcting: an expense has no loyalty side, so unlike a sale
// there is nothing about it that can only be set at the moment it happens.
export function ExpenseModal({record, close, save}: {
    record?: Expense;
    close: () => void;
    save: (record: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
}) {
    const [category, setCategory] = useState(record?.category || 'Supplies'),
        [payment, setPayment] = useState(record?.payment || 'Cash'), [note, setNote] = useState(record?.note || ''),
        [amount, setAmount] = useState(record ? String(record.amount) : '');
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({category, payment, note, amount: Number(amount)});
            close();
        } catch (err) {
            console.error('Failed to save expense', err);
            setError('Could not save this expense. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={record ? 'Edit expense' : 'Record an expense'} close={close}>
        <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">Category<select value={category}
                                                                                              onChange={e => setCategory(e.target.value)}
                                                                                              className="mt-1 w-full rounded-xl border-slate-200">
            <option>Supplies</option>
            <option>Staff</option>
            <option>Utilities</option>
            <option>Maintenance</option>
            <option>Transport</option>
            <option>Other</option>
        </select></label><label className="block text-sm font-medium">Payment source<select value={payment}
                                                                                            onChange={e => setPayment(e.target.value)}
                                                                                            className="mt-1 w-full rounded-xl border-slate-200">
            <option>Cash</option>
            <option>Transfer</option>
            <option>POS</option>
        </select></label><label className="block text-sm font-medium">Amount (₦)<input required min="1" type="number"
                                                                                       value={amount}
                                                                                       onChange={e => setAmount(e.target.value)}
                                                                                       className="mt-1 w-full rounded-xl border-slate-200"/></label><label
            className="block text-sm font-medium">Note <span
            className="font-normal text-slate-400">(optional)</span><input value={note}
                                                                           onChange={e => setNote(e.target.value)}
                                                                           placeholder="What was this for?"
                                                                           className="mt-1 w-full rounded-xl border-slate-200"/></label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting}
                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Saving…' : record ? 'Save changes' : 'Save expense'}</button>
        </form>
    </Modal>
}
