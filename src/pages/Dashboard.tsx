import { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { AgendaView } from "../components/agenda/AgendaView";
import { NotesList } from "../components/notas/NotesList";
import {
  listarPacientes,
  listarTurnosPorUsuario,
  listarPagosPorUsuario,
  listarNotasPorUsuario,
} from "../lib/firestore";
import { type Paciente, type Turno, type Pago } from "../types/index";
import {
  Clock,
  Users,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";

export function Dashboard({ uid }: { uid: string }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [notas, setNotas] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [uid]);

  const cargarDatos = async () => {
    try {
      const [p, t, pa, n] = await Promise.all([
        listarPacientes(uid),
        listarTurnosPorUsuario(uid),
        listarPagosPorUsuario(uid),
        listarNotasPorUsuario(uid),
      ]);
      setPacientes(p);
      setTurnos(t);
      setPagos(pa);
      setNotas(n);
    } catch (err) {
      console.warn("No se pudieron cargar los datos del dashboard:", err);
    }
  };

  const hoy = new Date();
  const turnosHoy = turnos.filter((t) => {
    const tFecha = new Date(t.fecha);
    return tFecha.toDateString() === hoy.toDateString();
  });
  const pagosPendientes = pagos.filter((p) => p.estado === "pendiente");
  const montoPendiente = pagosPendientes.reduce((acc, p) => acc + p.monto, 0);
  const notasPendientes = notas.filter(
    (n) =>
      n.tareasPendientes &&
      n.tareasPendientes.some((t: any) => !t.completada)
  ).length;

  const metricas = [
    {
      title: "Turnos hoy",
      valor: turnosHoy.length.toString(),
      cambio: `${turnosHoy.length} programados`,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Pagos pendientes",
      valor: pagosPendientes.length.toString(),
      cambio: `$${montoPendiente.toLocaleString("es-AR")}`,
      icon: CreditCard,
      color: "text-amber-400",
    },
    {
      title: "Pacientes activos",
      valor: pacientes.filter((p) => p.activo).length.toString(),
      cambio: `${pacientes.length} en total`,
      icon: Users,
      color: "text-slate-400",
    },
    {
      title: "Notas pendientes",
      valor: notasPendientes.toString(),
      cambio: "con tareas",
      icon: AlertCircle,
      color: "text-red-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-400">
          Resumen rápido de tu consultorio. {hoy.toLocaleDateString("es-AR")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((m, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{m.title}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{m.valor}</p>
                <p className="text-xs text-slate-500 mt-1">{m.cambio}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/50">
                <m.icon size={20} className={m.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Agenda de la semana
              </h2>
            </div>
            <div className="p-4">
              <AgendaView uid={uid} />
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card className="p-4 flex-1">
            <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Clock size={18} className="text-amber-400" />
              Cobros pendientes
            </h2>
            <div className="space-y-3">
              {pagosPendientes.slice(0, 5).map((pago) => (
                <div key={pago.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-900/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100">
                      Pago #{pago.id?.slice(0, 6) ?? "-"}
                    </p>
                    <p className="text-xs text-slate-400">{pago.pacienteId.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-100">
                      $${pago.monto.toLocaleString("es-AR")}
                    </p>
                    <Badge variant="destructive">Pendiente</Badge>
                  </div>
                </div>
              ))}
              {pagosPendientes.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">
                  No hay pagos pendientes.
                </p>
              )}
            </div>
          </Card>
          <Card className="p-4 flex-1">
            <h2 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              Accesos directos
            </h2>
            <div className="grid grid-cols-1 gap-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/40 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors">
                <Calendar size={16} />
                Gestionar agenda
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/40 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors">
                <CreditCard size={16} />
                Registrar cobro
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Notas recientes</h2>
        <NotesList uid={uid} onVerNota={() => {}} />
      </div>
    </div>
  );
}