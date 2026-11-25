import { useEffect, useState, useCallback } from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { type Usuario } from "../types/index";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profesional, setProfesional] = useState<Usuario | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "profesionales", u.uid));
          if (snap.exists()) {
            setProfesional({ ...(snap.data() as Omit<Usuario, 'id'>), uid: u.uid } as Usuario);
          } else {
            setProfesional({
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              role: "psicologo",
              fotoURL: u.photoURL ?? null,
              creadoEn: new Date(),
              actualizadoEn: new Date(),
            });
          }
        } catch (firestoreErr) {
          // Firestore puede no estar disponible o el cliente offline.
          // No bloqueamos el login: creamos el profesional con los datos de Auth.
          console.warn("Firestore no disponible, usando datos de Auth:", firestoreErr);
          setProfesional({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            role: "psicologo",
            fotoURL: u.photoURL ?? null,
            creadoEn: new Date(),
            actualizadoEn: new Date(),
          });
        }
      } else {
        setProfesional(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      return await signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string) => {
      return await createUserWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return { user, profesional, loading, login, register, logout };
}