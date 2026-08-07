import {useEffect} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {CheckCircle2, Info, TriangleAlert} from 'lucide-react';
import {type Toast, TOAST_MS, type Tone} from '../hooks/useToasts';

const TONES: Record<Tone, { icon: typeof CheckCircle2; tint: string }> = {
    success: {icon: CheckCircle2, tint: 'text-emerald-600'},
    info: {icon: Info, tint: 'text-blue-600'},
    warning: {icon: TriangleAlert, tint: 'text-amber-600'}
};

// Above the modal layer (z-50): a sale saved while a second modal is being opened should not
// slide in behind it.
export function Toasts({toasts, dismiss}: { toasts: Toast[]; dismiss: (id: string) => void }) {
    return <div aria-live="polite"
                className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
        <AnimatePresence initial={false}>{toasts.map(t => <ToastCard key={t.id} toast={t} dismiss={dismiss}/>)}</AnimatePresence>
    </div>
}

function ToastCard({toast, dismiss}: { toast: Toast; dismiss: (id: string) => void }) {
    const {id, tone, message} = toast, {icon: Icon, tint} = TONES[tone];
    useEffect(() => {
        const timer = setTimeout(() => dismiss(id), TOAST_MS);
        return () => clearTimeout(timer);
    }, [id, dismiss]);
    // Tappable to dismiss — the desk is a touchscreen, and a toast covering the button you are
    // reaching for has to be clearable without waiting it out.
    // Enters and leaves upward, towards the edge it is docked against — a card that slid up
    // from below to sit at the top reads as having come from somewhere else on the screen.
    return <motion.button type="button" onClick={() => dismiss(id)} aria-label={`Dismiss: ${message}`} layout
                          initial={{opacity: 0, y: -14, scale: 0.97}} animate={{opacity: 1, y: 0, scale: 1}}
                          exit={{opacity: 0, y: -8, scale: 0.97}} transition={{duration: 0.18}}
                          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-lg">
        <span className={`mt-0.5 shrink-0 ${tint}`}><Icon size={18}/></span><span
        className="text-sm font-medium text-slate-700">{message}</span>
    </motion.button>
}
