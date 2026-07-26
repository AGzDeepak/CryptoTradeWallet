import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GithubAuthProvider, 
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

// Firebase Project Configuration linked to tradebot-25d4f
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForTradebot25d4f",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tradebot-25d4f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tradebot-25d4f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tradebot-25d4f.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847291038291",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847291038291:web:94a827bc19aef29184"
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const githubProvider = new GithubAuthProvider();

// Scope request for GitHub user profile & email
githubProvider.addScope('user:email');
githubProvider.addScope('read:user');

export {
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
