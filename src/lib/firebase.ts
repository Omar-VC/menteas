import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración del proyecto Firebase (lee de variables de entorno con fallback a valores por defecto)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyD9I1oROnSQB9gf4iPfk5JPD4KJp6tK9yY",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    "gestion-profesional-d2f49.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ??
    "gestion-profesional-d2f49",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    "gestion-profesional-d2f49.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
    "975614177997",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    "1:975614177997:web:eca56694bab346c662af84",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;