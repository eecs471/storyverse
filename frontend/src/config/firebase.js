// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);