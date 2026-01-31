// Firebase Configuration Template
// Copy this file to ../Database/firebase-config.js and fill in your actual values

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Auth and Firestore references
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase initialized');

