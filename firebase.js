import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqs7FJF6uwyb55l2CGNYIR8hVXBjeDPjA",
  authDomain: "sistema-autenticado.firebaseapp.com",
  projectId: "sistema-autenticado",
  storageBucket: "sistema-autenticado.firebasestorage.app",
  messagingSenderId: "723624303713",
  appId: "1:723624303713:web:ae1925c7282832f57d1e20"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);