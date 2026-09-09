import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyATNQ5mvxoIDvyvGiLkd6g3LnYqW8h0bN0",
  authDomain: "stress-f5bf3.firebaseapp.com",
  databaseURL: "https://stress-f5bf3-default-rtdb.firebaseio.com",
  projectId: "stress-f5bf3",
  storageBucket: "stress-f5bf3.firebasestorage.app",
  messagingSenderId: "609097876784",
  appId: "1:609097876784:web:e30a0a9be6d27b65f634f5",
  measurementId: "G-QSTEQP5ZKB"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (supports environments with cookie/indexedDB restrictions)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized with ID:', firebaseConfig.measurementId);
    }
  }).catch((err) => {
    console.debug('Firebase analytics not active in this environment:', err?.message);
  });
}

export default app;
