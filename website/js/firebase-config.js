// Firebase configuration for DAMP Smart Drinkware Web App
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  projectId: "damp-smart-drinkware",
  appId: "1:309818614427:web:db15a4851c05e58aa25c3e",
  storageBucket: "damp-smart-drinkware.firebasestorage.app",
  apiKey: "AIzaSyAKkZEf6c3mTzDdOoDT6xmhhsmx1RP_G8w",
  authDomain: "damp-smart-drinkware.firebaseapp.com",
  messagingSenderId: "309818614427",
  measurementId: "G-YW2BN4SVPQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost') {
  // Connect to emulators only if not already connected
  if (!auth._delegate._config.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  }
  
  if (!db._delegate._config.settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  if (!functions._delegate.region) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
  
  if (!storage._delegate._config.host?.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
}

// Export the app instance
export default app; 