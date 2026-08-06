// Firebase Configuration
// Safe initialization — Firebase is optional. If keys are missing or invalid,
// the app runs in offline/demo mode. All Firestore/Auth calls are wrapped
// in try/catch in securityService.js so the app never crashes.

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

// Only initialize if real API keys are configured via .env file
// To enable Firebase: create a .env file at project root with VITE_FIREBASE_API_KEY, etc.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

let app = null;
let auth = null;
let db = null;
let githubProvider = null;
let googleProvider = null;

if (apiKey && projectId && !apiKey.includes('Demo') && !apiKey.includes('demo')) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };

    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    githubProvider = new GithubAuthProvider();
    githubProvider.addScope('user:email');
    githubProvider.addScope('read:user');
  } catch (err) {
    console.info('[Firebase] Initialization skipped — running in offline/demo mode.', err?.message);
    auth = null;
    db = null;
  }
} else {
  console.info('[Firebase] No valid API key found — running in offline/demo mode. App works fully without Firebase.');
}

export {
  app,
  auth,
  db,
  githubProvider,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
};
