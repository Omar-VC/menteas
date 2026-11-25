import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
  CircleCheck,
  CircleX,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Database,
  User,
  Lock,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { db } from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc as firestoreDoc,
  getDoc as getFirestoreDoc,
  setDoc as setFirestoreDoc,
  deleteDoc as deleteFirestoreDoc,
} from "firebase/firestore";

type TestStatus = "idle" | "running" | "success" | "error";

interface TestResult {
  name: string;
  status: TestStatus;
  message: string;
  detail?: string;
  duration?: number;
}

export function FirebaseConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Firebase Auth inicializado", status: "idle", message: "" },
    { name: "Usuario autenticado", status: "idle", message: "" },
    { name: "Firestore inicializado", status: "idle", message: "" },
    { name: "Escritura en Firestore", status: "idle", message: "" },
    { name: "Lectura desde Firestore", status: "idle", message: "" },
    { name: "Limpieza (borrar prueba)", status: "idle", message: "" },
  ]);
  const [running, setRunning] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const runTests = async () => {
    setRunning(true);
    const updated = tests.map((t) => ({ ...t, status: "idle", message: "" }));
    setTests(updated);

    let currentUser: FirebaseUser | null = null;

    // Test 1: Auth inicializado
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Firebase Auth inicializado"
            ? { ...t, status: "running", message: "Verificando..." }
            : t
        )
      );
      const start = performance.now();
      if (!auth) throw new Error("auth no está definido");
      currentUser = auth.currentUser;
      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Firebase Auth inicializado"
            ? {
                ...t,
                status: "success",
                message: "OK",
                detail: `SDK cargado en ${duration}s`,
              }
            : t
        )
      );
    } catch (err: any) {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Firebase Auth inicializado"
            ? { ...t, status: "error", message: "FALLO", detail: err.message }
            : t
        )
      );
    }

    // Test 2: Usuario autenticado
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Usuario autenticado"
            ? { ...t, status: "running", message: "Verificando..." }
            : t
        )
      );
      const start = performance.now();
      if (!currentUser) {
        throw new Error("No hay usuario autenticado. Iniciá sesión primero.");
      }
      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Usuario autenticado"
            ? {
                ...t,
                status: "success",
                message: currentUser.email ?? currentUser.uid,
                detail: `UID: ${currentUser.uid} (${duration}s)`,
              }
            : t
        )
      );
    } catch (err: any) {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Usuario autenticado"
            ? { ...t, status: "error", message: "FALLO", detail: err.message }
            : t
        )
      );
    }

    // Test 3: Firestore inicializado
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Firestore inicializado"
            ? { ...t, status: "running", message: "Verificando..." }
            : t
        )
      );
      const start = performance.now();
      if (!db) throw new Error("db no está definido");
      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Firestore inicializado"
            ? {
                ...t,
                status: "success",
                message: "OK",
                detail: `Proyecto: ${db.app.options.projectId} (${duration}s)`,
              }
            : t
        )
      );
    } catch (err: any) {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Firestore inicializado"
            ? { ...t, status: "error", message: "FALLO", detail: err.message }
            : t
        )
      );
    }

    // Test 4: Escritura en Firestore
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Escritura en Firestore"
            ? { ...t, status: "running", message: "Escribiendo..." }
            : t
        )
      );
      const start = performance.now();
      const testRef = firestoreDoc(db, "connection_test", "ping");
      await setFirestoreDoc(testRef, {
        test: true,
        createdAt: new Date().toISOString(),
        uid: currentUser?.uid ?? "anon",
      });
      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Escritura en Firestore"
            ? {
                ...t,
                status: "success",
                message: "OK",
                detail: `Documento escrito en ${duration}s`,
              }
            : t
        )
      );
    } catch (err: any) {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Escritura en Firestore"
            ? { ...t, status: "error", message: "FALLO", detail: err.message }
            : t
        )
      );
    }

    // Test 5: Lectura desde Firestore
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Lectura desde Firestore"
            ? { ...t, status: "running", message: "Leyendo..." }
            : t
        )
      );
      const start = performance.now();
      const testRef = firestoreDoc(db, "connection_test", "ping");
      const snap = await getFirestoreDoc(testRef);
      if (!snap.exists()) throw new Error("El documento no existe después de escribirlo");
      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Lectura desde Firestore"
            ? {
                ...t,
                status: "success",
                message: "OK",
                detail: `Leído en ${duration}s`,
              }
            : t
        )
      );
    } catch (err: any) {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Lectura desde Firestore"
            ? { ...t, status: "error", message: "FALLO", detail: err.message }
            : t
        )
      );
    }

    // Test 6: Limpieza
    try {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Limpieza (borrar prueba)"
            ? { ...t, status: "running", message: "Borrando..." }
            : t
        )
      );
      const start = performance.now();
      const testRef = firestoreDoc(db, "connection_test", "ping");
      await deleteFirestoreDoc(testRef);
      const duration = ((performance.now() - start) / 1000).toFixed(2);
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Limpieza (borrar prueba)"
            ? {
                ...t,
                status: "success",
                message: "OK",
                detail: `Eliminado en ${duration}s`,
              }
            : t
        )
      );
    } catch (err: any) {
      setTests((prev) =>
        prev.map((t) =>
          t.name === "Limpieza (borrar prueba)"
            ? { ...t, status: "error", message: "FALLO", detail: err.message }
            : t
        )
      );
    }

    setRunning(false);
  };

  const allSuccess = tests.every((t) => t.status === "success");
  const hasError = tests.some((t) => t.status === "error");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database size={20} className="text-primary" />
        <h2 className="text-lg font-bold text-slate-100">Prueba de conexión Firebase</h2>
      </div>
      <p className="text-sm text-slate-400">
        Ejecutá este diagnóstico para verificar que Auth y Firestore respondan correctamente desde la app.
      </p>

      <div className="flex gap-2">
        <Button
          onClick={runTests}
          disabled={running}
          variant={running ? "outline" : "default"}
        >
          {running ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
          {running ? "Probando..." : "Ejecutar diagnóstico"}
        </Button>
        {user && (
          <Button variant="outline" size="sm" onClick={() => {}}>
            <User size={16} className="mr-1" />
            {user.email}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {tests.map((test) => {
          const icon =
            test.status === "success" ? (
              <CircleCheck size={14} className="text-green-400" />
            ) : test.status === "error" ? (
              <CircleX size={14} className="text-red-400" />
            ) : test.status === "running" ? (
              <Loader2 size={14} className="text-amber-400 animate-spin" />
            ) : (
              <ShieldAlert size={14} className="text-slate-500" />
            );
          const badgeVariant =
            test.status === "success" ? "default" : test.status === "error" ? "destructive" : "outline";
          return (
            <div key={test.name} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/40">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <div className="text-sm font-medium text-slate-200">{test.name}</div>
                  {test.detail && (
                    <div className="text-xs text-slate-500">{test.detail}</div>
                  )}
                </div>
              </div>
              <Badge variant={badgeVariant} className="text-[10px]">
                {test.status === "success" ? "OK" : test.status === "error" ? "FALLO" : test.status === "running" ? "..." : "Pendiente"}
              </Badge>
              {test.status === "error" && test.message && (
                <div className="text-xs text-red-400 mt-1">{test.message}</div>
              )}
            </div>
          );
        })}
      </div>

      {allSuccess && tests.length > 0 && (
        <div className="p-3 rounded-lg bg-green-900/20 border border-green-900/30 text-sm text-green-400 flex items-start gap-2">
          <CircleCheck size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <strong>Todo funcionando.</strong> Firebase Auth y Firestore responden correctamente desde la app.
          </div>
        </div>
      )}

      {hasError && (
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-900/30 text-sm text-red-400 flex items-start gap-2">
          <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
          <div>
            <strong>Hay errores de conexión.</strong> Revisá los detalles de cada prueba.
            <ul className="mt-2 text-xs text-red-500 list-disc list-inside">
              <li>Si falla "Usuario autenticado": iniciá sesión en la app.</li>
              <li>Si falla "Firestore" o "Escritura": verificá las reglas de seguridad en Firebase Console.</li>
              <li>Si falla "Firebase Auth inicializado": verificá las credenciales en src/lib/firebase.ts.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}