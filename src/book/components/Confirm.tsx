import {useState} from 'react';
import {Modal} from './Modal';

// Asks before a write that the person on the other side of the counter will feel: one that is
// not undoable, or that moves a loyalty balance a customer is carrying a card for. It says
// what it is about to do, because the row or card that was tapped is behind the dialog by the
// time it opens.
//
// The confirm button holds its own in-flight state, so a forecourt tablet that does not answer
// instantly cannot be tapped into writing twice.
export function Confirm({title, detail, action, busyLabel = 'Saving…', tone = 'primary', error = 'Could not save this change. Please check your connection and try again.', close, confirm}: {
    title: string;
    detail: string;
    action: string;
    busyLabel?: string;
    // Red is for taking something away — a deleted record, a point off a card. Everything else
    // confirms in the ordinary accent, so the colour still means something when it is used.
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

// The delete preset, which is most of what asks. Kept as its own name because a deletion is
// the one thing in the book that cannot be pressed again to undo.
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
