import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';

// In a real self-hosted scenario, you would copy this from your Firebase Console
// Project Settings > General > Your apps > Firebase SDK snippet > Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Logs a new visit to Firestore and increments the global visitor counter.
 */
export async function trackVisit() {
  try {
    const visitId = 'visit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const visitRef = doc(db, 'visits', visitId);
    
    // Log individual visit
    await setDoc(visitRef, {
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      path: window.location.pathname
    });

    // Increment global counter
    const statsRef = doc(db, 'stats', 'global');
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      await updateDoc(statsRef, {
        visitCount: increment(1),
        lastUpdated: serverTimestamp()
      });
    } else {
      // Initialize if doesn't exist
      await setDoc(statsRef, {
        visitCount: 1,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.warn('Failed to track visit:', error);
  }
}

/**
 * Retrieves the current visit count from Firestore.
 */
export async function getVisitorCount(): Promise<number> {
  try {
    const statsRef = doc(db, 'stats', 'global');
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      return statsSnap.data()?.visitCount || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching visitor count:', error);
    return 0;
  }
}
