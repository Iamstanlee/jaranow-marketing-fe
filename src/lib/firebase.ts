import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
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

// A persistent cache rather than the default in-memory one. The desk is opened cold on a
// forecourt tablet several times a day, and with a memory cache every one of those reads
// every document back over mobile data before a single figure appears. Backed by IndexedDB
// the reload paints from disk and the listeners then deliver only what changed since — which
// is the difference between waiting on the network and waiting on nothing.
//
// The multi-tab manager is what makes that safe when the book is open in more than one tab:
// without it the first tab takes an exclusive lock and every other tab silently falls back to
// no persistence at all.
function startFirestore(instance: FirebaseApp) {
  try {
    return initializeFirestore(instance, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (error) {
    // Private browsing and locked-down webviews have no usable IndexedDB. Falling back costs
    // the reload speed, not the data — better than a desk that will not open at all.
    console.warn('Firestore persistence unavailable — using the in-memory cache.', error);
    return getFirestore(instance);
  }
}

export const db = app ? startFirestore(app) : null;

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
