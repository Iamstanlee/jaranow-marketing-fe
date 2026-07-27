import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

const app = firebaseEnabled ? initializeApp(config) : null;
export const db = app ? getFirestore(app) : null;

// The bookkeeping UI is gated by a client-side PIN, but that PIN never reaches the
// server, so Firestore must not trust the client on its own. We sign in anonymously
// so the security rules can require `request.auth != null` and reject any request
// that isn't coming through the app. `authReady` resolves once that anonymous session
// exists (or immediately when Firebase is disabled) — subscriptions await it before
// attaching listeners, otherwise a listener can fire before auth and be torn down by a
// permission-denied error that never retries.
export const authReady: Promise<void> = app
  ? signInAnonymously(getAuth(app)).then(() => undefined)
  : Promise.resolve();
