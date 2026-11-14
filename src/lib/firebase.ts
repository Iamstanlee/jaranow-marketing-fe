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

// IndexedDB cache so a cold open paints from disk and listeners fetch only changes. The
// multi-tab manager stops a second tab silently losing persistence.
function startFirestore(instance: FirebaseApp) {
  try {
    return initializeFirestore(instance, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (error) {
    // Private browsing has no usable IndexedDB.
    console.warn('Firestore persistence unavailable — using the in-memory cache.', error);
    return getFirestore(instance);
  }
}

export const db = app ? startFirestore(app) : null;

// The PIN is client-side only; rules require request.auth, so sign in anonymously. Listeners
// must await this — one attached before auth is torn down by permission-denied and never retries.
export const authReady: Promise<void> = app
  ? signInAnonymously(getAuth(app)).then(() => undefined)
  : Promise.resolve();
