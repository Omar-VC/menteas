/**
 * Tipos de dominio del sistema Menteas (SaaS de gestión de consultorios de psicología)
 * Todos los IDs de Firestore se manejan como strings.
 */

export type Role = "psicologo" | "admin";

export type EstadoPago = "pagado" | "pendiente" | "adelantado";

export type EstadoTurno = "confirmado" | "asistido" | "ausente" | "cancelado";

export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Usuario {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  fotoURL: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface Paciente {
  id?: string;
  uid: string; // ID del profesional dueño
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: Date | null;
  direccion: string | null;
  obraSocial: string | null;
  motivoConsulta: string | null;
  fechaAlta: Date;
  activo: boolean;
  horariosFijos: HorarioFijo[]; // horarios acordados en la primera sesión
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface HorarioFijo {
  id?: string;
  diaSemana: DiaSemana; // 0 = domingo ... 6 = sábado
  hora: string; // "HH:mm" en 24h
  duracionMinutos: number; // generalmente 50 o 60
  activo: boolean;
}

export interface Turno {
  id?: string;
  pacienteId: string;
  uid: string; // profesional
  fecha: Date; // fecha del turno (YYYY-MM-DD 00:00:00)
  horaInicio: string; // "HH:mm"
  horaFin: string;
  duracionMinutos: number;
  estado: EstadoTurno;
  tipo: "individual" | "pareja" | "familiar" | "grupal";
  notasBreves: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface Pago {
  id?: string;
  turnoId: string | null; // null si es pago por adelantado sin turno asociado aún
  pacienteId: string;
  uid: string;
  monto: number;
  fecha: Date;
  estado: EstadoPago;
  metodo: "efectivo" | "transferencia" | "tarjeta" | "otro";
  comprobanteUrl: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface NotaClinica {
  id?: string;
  pacienteId: string;
  turnoId: string | null;
  uid: string;
  fecha: Date;
  tipo: "evolucion" | "sesion" | "recordatorio" | "plan";
  contenido: string;
  tareasPendientes: TareaPendiente[];
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface TareaPendiente {
  id?: string;
  texto: string;
  completada: boolean;
  fechaVencimiento: Date | null;
}

export interface ResumenDashboard {
  turnosHoy: number;
  asistidosHoy: number;
  ausentesHoy: number;
  pagosPendientes: number;
  montoPendiente: number;
  pacientesActivos: number;
  notasPendientes: number;
}