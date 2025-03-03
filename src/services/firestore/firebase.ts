import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDeJjBHwAGS7aZckghRNB1z3XWJ8M2ZWt4",
  authDomain: "perfect-text-423af.firebaseapp.com",
  projectId: "perfect-text-423af",
  storageBucket: "perfect-text-423af.firebasestorage.app",
  messagingSenderId: "324523929791",
  appId: "1:324523929791:web:6ac9b371bc20bce6af160a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);