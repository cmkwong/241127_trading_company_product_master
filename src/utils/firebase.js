import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let firebaseApp;
let firebaseAuth;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const getConfig = () => ({
  apiKey: 'AIzaSyCGbrIRneX36nqxX4GxP7-5ynOpQtuMTB0',
  authDomain: 'rivolx-test.firebaseapp.com',
  projectId: 'rivolx-test',
  storageBucket: 'rivolx-test.firebasestorage.app',
  messagingSenderId: '449852201938',
  appId: '1:449852201938:web:7a52a346a57a507b15860b',
  measurementId: 'G-LLEK31DKSS',
});

/**
 * Lazily initialise and return the shared Firebase Auth instance. Kept lazy so
 * the rest of the app still loads when Firebase env vars are not yet configured.
 */
export const getFirebaseAuth = () => {
  if (firebaseAuth) return firebaseAuth;

  const config = getConfig();
  if (!config.apiKey || !config.projectId) {
    throw new Error(
      'Firebase is not configured. Add VITE_FIREBASE_* variables to .env.',
    );
  }

  firebaseApp = initializeApp(config);
  firebaseAuth = getAuth(firebaseApp);
  return firebaseAuth;
};
