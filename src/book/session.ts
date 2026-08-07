import type {Role} from './types';

// The desk is a tablet left open at the forecourt and unlocked once at the start of a shift,
// so re-entering the PIN on every reload was pushing staff towards writing it down. The
// session records which PIN was entered and when; it is not a credential — Firestore still
// does its own anonymous auth, and anyone holding the device can read the books anyway.
const SESSION_KEY = 'jaranow.book.session';
const SESSION_MS = 24 * 60 * 60 * 1000;
export type Session = { role: Role; expires: number };

export const readSession = (): Session | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw) as Session;
        // An expired session, a clock moved backwards, a hand-edited value and an older shape
        // all read as "no session" rather than as one that never ends.
        if ((session?.role !== 'admin' && session?.role !== 'staff') || !(session.expires > Date.now())) {
            clearSession();
            return null;
        }
        return session;
    } catch {
        return null;
    }
};
// Storage throws in private modes and when the quota is full; losing the session there means
// the PIN is asked for every time, which is the old behaviour rather than a broken desk.
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
