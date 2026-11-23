import React, {useState} from 'react';
import {EXPENSE_CATEGORIES, PAYMENT_METHODS} from '../constants';
import type {Expense} from '../types';
import {isoDay} from '../format';
import {DayField} from './Fields';
import {Modal} from './Modal';

export function ExpenseModal({record, admin = false, close, save}: {
    record?: Expense;
    admin?: boolean;
    close: () => void;
    save: (record: Omit<Expense, 'id' | 'createdAt'>, on?: string) => Promise<void>
}) {
    const [on, setOn] = useState(() => isoDay(new Date()));
    const dated = admin && !record;
    // Keep a retired category selectable, or editing would silently refile the expense.
    const options: string[] = record?.category && !EXPENSE_CATEGORIES.includes(record.category as typeof EXPENSE_CATEGORIES[number])
        ? [record.category, ...EXPENSE_CATEGORIES] : [...EXPENSE_CATEGORIES];
    const [category, setCategory] = useState(record?.category || options[0]),
        [payment, setPayment] = useState(record?.payment || 'Cash'), [note, setNote] = useState(record?.note || ''),
        [amount, setAmount] = useState(record ? String(record.amount) : '');
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await save({category, payment, note, amount: Number(amount)}, dated ? on : undefined);
            close();
        } catch (err) {
            console.error('Failed to save expense', err);
            setError('Could not save this expense. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={record ? 'Edit expense' : 'Record an expense'} close={close}>
        <form onSubmit={submit} className="space-y-4">{dated && <DayField value={on} onChange={setOn}/>}<label className="block text-sm font-medium">Category<select value={category}
                                                                                              onChange={e => setCategory(e.target.value)}
                                                                                              className="mt-1 w-full rounded-xl border-slate-200">
            {options.map(option => <option key={option}>{option}</option>)}
        </select></label><label className="block text-sm font-medium">Payment source<select value={payment}
                                                                                            onChange={e => setPayment(e.target.value)}
                                                                                            className="mt-1 w-full rounded-xl border-slate-200">
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
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
