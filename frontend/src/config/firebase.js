// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDasDVZ5spnkwP8fKMiO1UAhQcbZzy3bSU",
  authDomain: "storyverse-4976b.firebaseapp.com",
  projectId: "storyverse-4976b",
  storageBucket: "storyverse-4976b.appspot.com",
  messagingSenderId: "648909954140",
  appId: "1:648909954140:web:80d65098d0a2624d7a5a99",
  measurementId: "G-S09NKYJCD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const storageBucket = firebaseConfig.storageBucket;
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);