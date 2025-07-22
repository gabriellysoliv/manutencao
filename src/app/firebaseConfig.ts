// firebaseConfig.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

// 🔐 Substitua pelas suas credenciais reais do Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyAdVgMdqVpUuxgjVoUiqBEdhqC09VlC-2s",
  authDomain: "reactmanutencao.firebaseapp.com",
  projectId: "reactmanutencao",
  storageBucket: "reactmanutencao.firebasestorage.app",
  messagingSenderId: "1045333053476",
  appId: "1:1045333053476:web:eafc0fd47c4a45d82608b1",
  measurementId: "G-J33CCJFW1P"
};

// ✅ Inicializa o Firebase apenas uma vez
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔧 Exporta os serviços
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export { app, auth, db, storage, functions, httpsCallable };
