import React from 'react';
import {ShieldCheck} from 'lucide-react';

export function PinGate({pin, setPin, error, login}: {
    pin: string;
    setPin: (v: string) => void;
    error: string;
    login: (e: React.FormEvent) => void
}) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-5">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white"><ShieldCheck/></div>
            <h1 className="mt-6 text-2xl font-bold">Unlock the book</h1><p
            className="mt-2 text-sm leading-6 text-slate-500">Enter your Admin or Staff PIN to access Jaranow Business
            Desk.</p><input autoFocus required inputMode="numeric" type="password" value={pin}
                            onChange={e => setPin(e.target.value)} placeholder="Enter PIN"
                            className="mt-6 w-full rounded-xl border-slate-200 py-3 text-center tracking-[0.5em]"/><p
            className="mt-2 min-h-5 text-xs text-red-600">{error}</p>
            <button className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white">Unlock</button>
        </form>
    </main>
}
