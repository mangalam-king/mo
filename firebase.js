import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAk_pzO_t0523S5NuuunOWRPVSt1vCkKyE",
  authDomain: "mo-olympiad.firebaseapp.com",
  projectId: "mo-olympiad",
  storageBucket: "mo-olympiad.firebasestorage.app",
  messagingSenderId: "53273588231",
  appId: "1:53273588231:web:fdad2ebf9d51e52013f0a2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
