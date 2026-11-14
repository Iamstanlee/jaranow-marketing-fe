import {useCallback, useEffect, useRef, useState} from 'react';
import {CheckCircle2, Info, TriangleAlert} from 'lucide-react';
import {type Toast, TOAST_MS, type Tone} from '../hooks/useToasts';

const TONES: Record<Tone, { icon: typeof CheckCircle2; tint: string }> = {
    success: {icon: CheckCircle2, tint: 'text-emerald-600'},
    info: {icon: Info, tint: 'text-blue-600'},
    warning: {icon: TriangleAlert, tint: 'text-amber-600'}
};

// Must match the .book-toast-leaving transition in index.css.
const LEAVE_MS = 180;

// z-[60]: above modals.
export function Toasts({toasts, dismiss}: { toasts: Toast[]; dismiss: (id: string) => void }) {
    return <div aria-live="polite"
                className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
        {toasts.map(t => <ToastCard key={t.id} toast={t} dismiss={dismiss}/>)}
    </div>
}

function ToastCard({toast, dismiss}: { toast: Toast; dismiss: (id: string) => void }) {
    const {id, tone, message} = toast, {icon: Icon, tint} = TONES[tone];
    // Animate out, then remove. The ref stops the timer and a tap both scheduling removal.
    const [leaving, setLeaving] = useState(false);
    const leavingRef = useRef(false);
    const close = useCallback(() => {
        if (leavingRef.current) return;
        leavingRef.current = true;
        setLeaving(true);
        setTimeout(() => dismiss(id), LEAVE_MS);
    }, [id, dismiss]);
    useEffect(() => {
        const timer = setTimeout(close, TOAST_MS);
        return () => clearTimeout(timer);
    }, [close]);
    return <button type="button" onClick={close} aria-label={`Dismiss: ${message}`}
                   className={`book-toast${leaving ? ' book-toast-leaving' : ''} pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-lg`}>
        <span className={`mt-0.5 shrink-0 ${tint}`}><Icon size={18}/></span><span
        className="text-sm font-medium text-slate-700">{message}</span>
    </button>
}
