import React from 'react';
import {X} from 'lucide-react';

export function Modal({title, close, children}: { title: string; close: () => void; children: React.ReactNode }) {
    // data-modal marks the layer for useDrawerSwipe, which ignores gestures that start inside
    // it — a swipe across an open form is not a request to open the sidebar behind it.
    return <div data-modal role="dialog" aria-modal="true" aria-label={title}
                className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
        <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2>
                <button type="button" onClick={close}><X size={20}/></button>
            </div>
            {children}</section>
    </div>
}
