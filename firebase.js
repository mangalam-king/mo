// ============================================================
// MO OLYMPIAD - FIREBASE CONFIGURATION
// ============================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyAk_pzO_t0523S5NuuunOWRPVSt1vCkKyE",

  authDomain:
    "mo-olympiad.firebaseapp.com",

  projectId:
    "mo-olympiad",

  storageBucket:
    "mo-olympiad.firebasestorage.app",

  messagingSenderId:
    "53273588231",

  appId:
    "1:53273588231:web:fdad2ebf9d51e52013f0a2"

};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// FIRESTORE
// ============================================================

const db = getFirestore(app);


// ============================================================
// AUTHENTICATION
// ============================================================

const auth = getAuth(app);

const googleProvider =
  new GoogleAuthProvider();


// Optional: always request the Google account selector
googleProvider.setCustomParameters({
  prompt: "select_account"
});


// ============================================================
// EXPORT EVERYTHING
// ============================================================

export {

  // Firestore
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,

  // Authentication
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged

};
