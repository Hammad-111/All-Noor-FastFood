// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Added compat imports for libraries like expo-firebase-recaptcha
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// AL NOOR FAST FOOD - Real Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3Wy1n3YITDR6RYlH7ArNSIKtICUM0vUQ",
    authDomain: "al-noor-fast-food.firebaseapp.com",
    projectId: "al-noor-fast-food",
    storageBucket: "al-noor-fast-food.firebasestorage.app",
    messagingSenderId: "728471520944",
    appId: "1:728471520944:web:97cdf3dbafccbfd7ba9d75",
    measurementId: "G-3LXVDSDQXM"
};

// --- INITIALIZATION ---
// Initialize the compat app (this creates the '[DEFAULT]' app)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Map the modular instance to the compat app to ensure consistency
const app = firebase.app();

// Export modular instances for use across the app
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

