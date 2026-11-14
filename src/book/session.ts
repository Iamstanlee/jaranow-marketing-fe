import type {Role} from './types';

// Remembers which PIN unlocked the desk for 24h so staff are not re-prompted on every reload.
// Not a credential: Firestore does its own anonymous auth.
const SESSION_KEY = 'jaranow.book.session';
const SESSION_MS = 24 * 60 * 60 * 1000;
export type Session = { role: Role; expires: number };

export const readSession = (): Session | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as Session;
        // Expired, malformed or hand-edited: no session.
        if ((session?.role !== 'admin' && session?.role !== 'staff') || !(session.expires > Date.now())) {
            clearSession();
            return null;
        }
        return session;
    } catch {
        return null;
    }
};
// Storage can throw (private mode, full quota); then the PIN is simply asked every time.
export const writeSession = (role: Role): Session => {
    const session = {role, expires: Date.now() + SESSION_MS};
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
    }
    return session;
};

export function clearSession() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch {
    }
}
