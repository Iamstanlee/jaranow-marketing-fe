import {useState} from 'react';
import {Modal} from './Modal';

// Deleting is not undoable and moves a loyalty balance, so it asks — and says what it is
// about to remove, because the row that was tapped is behind the dialog by the time it opens.
export function ConfirmDelete({title, detail, close, confirm}: {
    title: string;
    detail: string;
    close: () => void;
    confirm: () => Promise<void>
}) {
    const [submitting, setSubmitting] = useState(false), [error, setError] = useState('');
    const go = async () => {
        if (submitting) return;
        setSubmitting(true);
        setError('');
        try {
            await confirm();
            close();
        } catch (err) {
            console.error('Failed to delete record', err);
            setError('Could not delete this record. Please check your connection and try again.');
            setSubmitting(false);
        }
    };
    return <Modal title={title} close={close}>
        <p className="text-sm leading-6 text-slate-500">{detail}</p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
            <button type="button" onClick={close}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600">Cancel
            </button>
            <button type="button" onClick={go} disabled={submitting}
                    className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white disabled:opacity-60">{submitting ? 'Deleting…' : 'Delete'}</button>
        </div>
    </Modal>
}
