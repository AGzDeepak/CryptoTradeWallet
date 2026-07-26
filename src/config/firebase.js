import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GithubAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';

// Firebase Project Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoConfigKeyForChainblockApp12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chainblock-ai-trading.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chainblock-ai-trading",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chainblock-ai-trading.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "847291038291",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:847291038291:web:94a827bc19aef29184"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();

// Scope request for GitHub user profile & email
githubProvider.addScope('user:email');
githubProvider.addScope('read:user');

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
};
