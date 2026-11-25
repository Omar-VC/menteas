import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  type DocumentData,
  type CollectionReference,
  type DocumentReference,
  type DocumentSnapshot,
  type QuerySnapshot,
  type WriteBatch,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  type Paciente,
  type Turno,
  type Pago,
  type NotaClinica,
} from "../types/index";

export function col<T extends DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

export function docRef<T extends DocumentData>(path: string): DocumentReference<T> {
  return doc(db, path) as DocumentReference<T>;
}

export function toEntity<T extends { id?: string }>(
  snap: DocumentSnapshot<DocumentData>
): T | null {
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...(data as T), id: snap.id } as T;
}

export function toEntities<T extends { id?: string }>(
  snap: QuerySnapshot<DocumentData>
): T[] {
  return snap.docs.map((d: QuerySnapshot<DocumentData>["docs"][number]) => ({
    ...(d.data() as T),
    id: d.id,
  }) as T);
}

/* ------------------------------------------------------------------ */
/*                        Pacientes                                   */
/* ------------------------------------------------------------------ */

export const PACIENTES_COL = "pacientes";

export async function crearPaciente(
  data: Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>
): Promise<string> {
  const ahora = new Date();
  const ref = await addDoc(col<Paciente>(PACIENTES_COL), {
    ...data,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });
  return ref.id;
}

export async function obtenerPaciente(id: string): Promise<Paciente | null> {
  const snap = await getDoc(docRef<Paciente>(`${PACIENTES_COL}/${id}`));
  return toEntity<Paciente>(snap);
}

export async function listarPacientes(uid: string): Promise<Paciente[]> {
  const q = query(
    col<Paciente>(PACIENTES_COL),
    where("uid", "==", uid),
    where("activo", "==", true),
    orderBy("apellido", "asc"),
    orderBy("nombre", "asc")
  );
  const snap = await getDocs(q);
  return toEntities<Paciente>(snap);
}

export async function actualizarPaciente(
  id: string,
  data: Partial<Omit<Paciente, 'id' | 'creadoEn' | 'actualizadoEn'>>
): Promise<void> {
  await updateDoc(docRef<Paciente>(`${PACIENTES_COL}/${id}`), {
    ...data,
    actualizadoEn: new Date(),
  });
}

export async function eliminarPaciente(id: string): Promise<void> {
  await deleteDoc(docRef<Paciente>(`${PACIENTES_COL}/${id}`));
}

/* ------------------------------------------------------------------ */
/*                        Turnos                                      */
/* ------------------------------------------------------------------ */

export const TURNOS_COL = "turnos";

export async function crearTurno(
  data: Omit<Turno, 'id' | 'creadoEn' | 'actualizadoEn'>
): Promise<string> {
  const ahora = new Date();
  const ref = await addDoc(col<Turno>(TURNOS_COL), {
    ...data,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });
  return ref.id;
}

export async function obtenerTurno(id: string): Promise<Turno | null> {
  const snap = await getDoc(docRef<Turno>(`${TURNOS_COL}/${id}`));
  return toEntity<Turno>(snap);
}

export async function listarTurnosPorFecha(uid: string, fecha: Date): Promise<Turno[]> {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999);
  const q = query(
    col<Turno>(TURNOS_COL),
    where("uid", "==", uid),
    where("fecha", ">=", inicio),
    where("fecha", "<=", fin),
    orderBy("horaInicio", "asc")
  );
  const snap = await getDocs(q);
  return toEntities<Turno>(snap);
}

export async function listarTurnosSemana(uid: string, lunes: Date): Promise<Turno[]> {
  const inicio = new Date(lunes);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(lunes);
  fin.setDate(fin.getDate() + 7);
  fin.setHours(23, 59, 59, 999);
  const q = query(
    col<Turno>(TURNOS_COL),
    where("uid", "==", uid),
    where("fecha", ">=", inicio),
    where("fecha", "<", fin),
    orderBy("fecha", "asc"),
    orderBy("horaInicio", "asc")
  );
  const snap = await getDocs(q);
  return toEntities<Turno>(snap);
}

export async function actualizarTurno(
  id: string,
  data: Partial<Omit<Turno, 'id' | 'creadoEn' | 'actualizadoEn'>>
): Promise<void> {
  await updateDoc(docRef<Turno>(`${TURNOS_COL}/${id}`), {
    ...data,
    actualizadoEn: new Date(),
  });
}

export async function eliminarTurno(id: string): Promise<void> {
  await deleteDoc(docRef<Turno>(`${TURNOS_COL}/${id}`));
}

/* ------------------------------------------------------------------ */
/*                        Pagos                                       */
/* ------------------------------------------------------------------ */

export const PAGOS_COL = "pagos";

export async function crearPago(
  data: Omit<Pago, 'id' | 'creadoEn' | 'actualizadoEn'>
): Promise<string> {
  const ahora = new Date();
  const ref = await addDoc(col<Pago>(PAGOS_COL), {
    ...data,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });
  return ref.id;
}

export async function obtenerPago(id: string): Promise<Pago | null> {
  const snap = await getDoc(docRef<Pago>(`${PAGOS_COL}/${id}`));
  return toEntity<Pago>(snap);
}

export async function listarPagosPendientes(uid: string): Promise<Pago[]> {
  const q = query(
    col<Pago>(PAGOS_COL),
    where("uid", "==", uid),
    where("estado", "==", "pendiente"),
    orderBy("fecha", "asc")
  );
  const snap = await getDocs(q);
  return toEntities<Pago>(snap);
}

export async function listarPagosPorPaciente(pacienteId: string): Promise<Pago[]> {
  const q = query(
    col<Pago>(PAGOS_COL),
    where("pacienteId", "==", pacienteId),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return toEntities<Pago>(snap);
}

export async function actualizarPago(
  id: string,
  data: Partial<Omit<Pago, 'id' | 'creadoEn' | 'actualizadoEn'>>
): Promise<void> {
  await updateDoc(docRef<Pago>(`${PAGOS_COL}/${id}`), {
    ...data,
    actualizadoEn: new Date(),
  });
}

export async function eliminarPago(id: string): Promise<void> {
  await deleteDoc(docRef<Pago>(`${PAGOS_COL}/${id}`));
}

/* ------------------------------------------------------------------ */
/*                        Notas clínicas                              */
/* ------------------------------------------------------------------ */

export const NOTAS_COL = "notas_clinicas";

export async function crearNota(
  data: Omit<NotaClinica, 'id' | 'creadoEn' | 'actualizadoEn'>
): Promise<string> {
  const ahora = new Date();
  const ref = await addDoc(col<NotaClinica>(NOTAS_COL), {
    ...data,
    creadoEn: ahora,
    actualizadoEn: ahora,
  });
  return ref.id;
}

export async function obtenerNota(id: string): Promise<NotaClinica | null> {
  const snap = await getDoc(docRef<NotaClinica>(`${NOTAS_COL}/${id}`));
  return toEntity<NotaClinica>(snap);
}

export async function listarNotasPorPaciente(pacienteId: string): Promise<NotaClinica[]> {
  const q = query(
    col<NotaClinica>(NOTAS_COL),
    where("pacienteId", "==", pacienteId),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return toEntities<NotaClinica>(snap);
}

export async function actualizarNota(
  id: string,
  data: Partial<Omit<NotaClinica, 'id' | 'creadoEn' | 'actualizadoEn'>>
): Promise<void> {
  await updateDoc(docRef<NotaClinica>(`${NOTAS_COL}/${id}`), {
    ...data,
    actualizadoEn: new Date(),
  });
}

export async function eliminarNota(id: string): Promise<void> {
  await deleteDoc(docRef<NotaClinica>(`${NOTAS_COL}/${id}`));
}


/* ------------------------------------------------------------------ */
/*                        Notas por usuario                           */
/* ------------------------------------------------------------------ */

export async function listarNotasPorUsuario(uid: string): Promise<NotaClinica[]> {
  const q = query(
    col<NotaClinica>(NOTAS_COL),
    where("uid", "==", uid),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return toEntities<NotaClinica>(snap);
}

export async function listarTurnosPorUsuario(uid: string): Promise<Turno[]> {
  const q = query(
    col<Turno>(TURNOS_COL),
    where("uid", "==", uid),
    orderBy("fecha", "desc"),
    orderBy("horaInicio", "asc")
  );
  const snap = await getDocs(q);
  return toEntities<Turno>(snap);
}

export async function listarPagosPorUsuario(uid: string): Promise<Pago[]> {
  const q = query(
    col<Pago>(PAGOS_COL),
    where("uid", "==", uid),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return toEntities<Pago>(snap);
}
/* ------------------------------------------------------------------ */
/*                        Batch                                       */
/* ------------------------------------------------------------------ */

export function batch(): WriteBatch {
  return writeBatch(db);
}

export { serverTimestamp };

export type { Paciente, Turno, Pago, NotaClinica, Usuario, HorarioFijo } from "../types/index";