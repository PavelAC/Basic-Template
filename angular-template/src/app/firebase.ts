// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHMeTH6TolX7YYvh13q75oLbf879gEwZY",
  authDomain: "template-edf17.firebaseapp.com",
  projectId: "template-edf17",
  storageBucket: "template-edf17.firebasestorage.app",
  messagingSenderId: "352490275257",
  appId: "1:352490275257:web:80b605186b3152820d7668",
  measurementId: "G-6HJMQLR7ET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);