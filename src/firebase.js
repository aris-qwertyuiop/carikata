import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9KQ_olfGdx0pkEezhF4DRvXfbONkDo0w",
  authDomain: "carikata-e058b.firebaseapp.com",
  projectId: "carikata-e058b",
  storageBucket: "carikata-e058b.firebasestorage.app",
  messagingSenderId: "869719086268",
  appId: "1:869719086268:web:61328604029fd113c02cb9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;