import {useEffect, useRef, useState} from 'react';
import {MoreVertical} from 'lucide-react';

// One action in the menu. `hint` is what a disabled row says for itself — a row that is dead
// with no explanation reads as a broken button, and the reason is usually short enough to sit
// under the label.
export type Action = {
    label: string;
    icon: typeof MoreVertical;
    onSelect: () => void;
    disabled?: boolean;
    hint?: string;
    tone?: 'default' | 'danger'
};

// A menu behind a single button, for actions that are worth doing but not worth a permanent
// control on the face of a card. Everything it offers opens a dialog, so it is a way in
// rather than a place anything is committed.
export function ActionMenu({label, items}: { label: string; items: Action[] }) {
    const [open, setOpen] = useState(false);
    const wrap = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!open) return;
        // pointerdown rather than click, so the menu is already gone when the finger lifts and
        // a tap aimed past it is not spent closing it.
        const away = (e: PointerEvent) => {
            if (!wrap.current?.contains(e.target as Node)) setOpen(false);
        };
        const key = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setOpen(false);
            trigger.current?.focus();
        };
        document.addEventListener('pointerdown', away);
        document.addEventListener('keydown', key);
        return () => {
            document.removeEventListener('pointerdown', away);
            document.removeEventListener('keydown', key);
        };
    }, [open]);
    return <div ref={wrap} className="relative">
        <button ref={trigger} type="button" onClick={() => setOpen(v => !v)} aria-haspopup="menu"
                aria-expanded={open} aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600">
            <MoreVertical size={15}/></button>
        {/* Positioned, so it paints over the cards beside and below it — the grid gives every
            card the same height and this hangs past the bottom of a short one. */}
        {open && <div role="menu" aria-label={label}
                      className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            {items.map(item => {
                const Icon = item.icon;
                return <button key={item.label} type="button" role="menuitem" disabled={item.disabled}
                               onClick={() => {
                                   setOpen(false);
                                   item.onSelect();
                               }}
                               className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium disabled:opacity-50 ${item.tone === 'danger' ? 'text-red-600 enabled:hover:bg-red-50' : 'text-slate-600 enabled:hover:bg-slate-50'}`}>
                    <Icon size={16} className="shrink-0"/>
                    <span>{item.label}{item.hint &&
                        <span className="block text-xs font-normal text-slate-400">{item.hint}</span>}</span>
                </button>;
            })}
        </div>}
    </div>;
}
