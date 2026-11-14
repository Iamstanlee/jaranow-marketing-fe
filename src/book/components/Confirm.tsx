import React, {useState} from 'react';
import {Modal} from './Modal';

// Holds its own in-flight state so a slow tablet cannot be tapped into writing twice.
export function Confirm({title, detail, action, busyLabel = 'Saving…', tone = 'primary', error = 'Could not save this change. Please check your connection and try again.', close, confirm, children}: {
    title: string;
    detail: string;
    children?: React.ReactNode;
    action: string;
    busyLabel?: string;
    // danger = taking something away.
    tone?: 'primary' | 'danger';
    error?: string;
    close: () => void;
    confirm: () => Promise<void>
}) {
    const [submitting, setSubmitting] = useState(false), [failed, setFailed] = useState('');
    const go = async () => {
        if (submitting) return;
        setSubmitting(true);
        setFailed('');
        try {
            await confirm();
            close();
        } catch (err) {
            console.error(`Failed to ${action.toLowerCase()}`, err);
            setFailed(error);
            setSubmitting(false);
        }
    };
    return <Modal title={title} close={close}>
        <p className="text-sm leading-6 text-slate-500">{detail}</p>
        {children}
        {failed && <p role="alert" className="mt-3 text-sm text-red-600">{failed}</p>}
        <div className="mt-6 flex gap-3">
            <button type="button" onClick={close}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600">Cancel
            </button>
            <button type="button" onClick={go} disabled={submitting}
                    className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60 ${tone === 'danger' ? 'bg-red-600' : 'bg-blue-600'}`}>{submitting ? busyLabel : action}</button>
        </div>
    </Modal>
}

export function ConfirmDelete({title, detail, close, confirm}: {
    title: string;
    detail: string;
    close: () => void;
    confirm: () => Promise<void>
}) {
    return <Confirm title={title} detail={detail} action="Delete" busyLabel="Deleting…" tone="danger"
                    error="Could not delete this record. Please check your connection and try again."
                    close={close} confirm={confirm}/>;
}
