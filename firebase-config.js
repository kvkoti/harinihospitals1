
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "ATzaSyB64iS062Y5BwF39i1Wyx5FBF4xaT01WTT",
  authDomain: "harini-hospitals-marketing.firebaseapp.com",
  projectId: "harini-hospitals-marketing",
  storageBucket: "harini-hospitals-marketing.firebasestorage.app",
  messagingSenderId: "53204842158",
  appId: "1:53204842158:web:cff2abbedc9d0fc77e5f3f",
  measurementId: "G-VG4V6FM52P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
