import { initializeApp } from 'firebase/app';
import * as Auth from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: "compozit-3b609.firebaseapp.com",
  projectId: "compozit-3b609",
  storageBucket: "compozit-3b609.firebasestorage.app",
  messagingSenderId: "219002130447",
  appId: "1:219002130447:android:6a5e82b7f62920a172937a",
  measurementId: "G-XX7R8VJ76D"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firebase Auth avec persistance AsyncStorage si disponible
let auth: any;
try {
  const maybePersistence = (Auth as any).getReactNativePersistence;
  if (typeof maybePersistence === 'function') {
    auth = (Auth as any).initializeAuth(app, {
      persistence: maybePersistence(ReactNativeAsyncStorage),
    });
    console.log('✅ Firebase Auth initialisé avec AsyncStorage persistence');
  } else {
    auth = (Auth as any).getAuth(app);
    console.log('✅ Firebase Auth initialisé (fallback getAuth, persistance auto RN)');
  }
} catch (error) {
  try {
    // Fallback si initializeAuth échoue (par ex. déjà initialisé)
    auth = (Auth as any).getAuth(app);
    console.log('✅ Firebase Auth récupéré (déjà initialisé)');
  } catch (error2) {
    console.error('❌ Erreur initialisation Firebase Auth:', error2);
    auth = null;
  }
}

export { auth };

// Initialiser Firestore avec configuration spéciale pour React Native
let firestore: any;
try {
  // Essayer d'initialiser Firestore avec des paramètres spéciaux
  firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Pour React Native
  });
  console.log('✅ Firestore initialisé avec initializeFirestore');
} catch (error) {
  try {
    // Fallback vers getFirestore standard
    firestore = getFirestore(app);
    console.log('✅ Firestore initialisé avec getFirestore');
  } catch (error2) {
    console.error("❌ Impossible d'initialiser Firestore:", error2);
    firestore = null;
  }
}

export { firestore };

// Vérifier que Firestore est disponible
export const isFirestoreAvailable = (): boolean => {
  return firestore !== null;
};

export default app;
