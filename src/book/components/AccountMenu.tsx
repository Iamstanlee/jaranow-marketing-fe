import {useEffect, useRef, useState} from 'react';
import {LogOut} from 'lucide-react';
import type {Role} from '../types';

// Opens on hover where there is a pointer, and on tap for the tablet.
export function AccountMenu({role, onLogout}: { role: Role; onLogout: () => void }) {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const away = (e: PointerEvent) => {
            if (!box.current?.contains(e.target as Node)) setOpen(false);
        };
        const escape = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('pointerdown', away);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('pointerdown', away);
            document.removeEventListener('keydown', escape);
        };
    }, [open]);

    const hover = (next: boolean) => (e: React.PointerEvent) => e.pointerType === 'mouse' && setOpen(next);

    return <div ref={box} className="relative" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
        <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
                aria-label={`${role} account`}
                className={`grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-sm font-bold uppercase text-white ring-offset-2 transition-shadow ${open ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-slate-300'}`}>
            {role[0]}
        </button>
        {open && <div role="menu" className="absolute right-0 top-full z-40 pt-2">
            <div className="w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold">Jaranow car wash</p>
                    <p className="text-xs capitalize text-slate-400">{role} access</p>
                </div>
                <button type="button" role="menuitem" onClick={() => {
                    setOpen(false);
                    onLogout();
                }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
                    <LogOut size={16}/> Log out
                </button>
            </div>
        </div>}
    </div>;
}
