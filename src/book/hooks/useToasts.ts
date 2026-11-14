import {useCallback, useState} from 'react';

// Confirms writes after their modal closes. Failures stay inline in the modal instead.
export type Tone = 'success' | 'info' | 'warning';
export type Toast = { id: string; tone: Tone; message: string };
export type Notify = (message: string, tone?: Tone) => void;

export const TOAST_MS = 4500;
const TOAST_LIMIT = 3;

export function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const dismiss = useCallback((id: string) => setToasts(list => list.filter(t => t.id !== id)), []);
    const toast = useCallback<Notify>((message, tone: Tone = 'success') => setToasts(list => [...list.slice(1 - TOAST_LIMIT), {
        id: crypto.randomUUID(),
        tone,
        message
    }]), []);
    return {toasts, toast, dismiss};
}
