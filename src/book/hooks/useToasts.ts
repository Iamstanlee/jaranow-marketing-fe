import {useCallback, useState} from 'react';

// A write that succeeds closes its modal, so without this the desk gives no sign anything
// happened — an attendant at a forecourt tablet re-records the sale to be sure. Failures keep
// their inline message in the modal, where the form that has to be retried still is; toasts
// are for what the closed modal can no longer say.
export type Tone = 'success' | 'info' | 'warning';
export type Toast = { id: string; tone: Tone; message: string };
export type Notify = (message: string, tone?: Tone) => void;

export const TOAST_MS = 4500;
const TOAST_LIMIT = 3;

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    // Stable, because each card sets its own dismissal timer off it in an effect.
    const dismiss = useCallback((id: string) => setToasts(list => list.filter(t => t.id !== id)), []);
    const toast = useCallback<Notify>((message, tone: Tone = 'success') => setToasts(list => [...list.slice(1 - TOAST_LIMIT), {
        id: crypto.randomUUID(),
        tone,
        message
    }]), []);
    return {toasts, toast, dismiss};
}
