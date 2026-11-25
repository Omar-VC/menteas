import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { formatUtils } from "../../utils/formatUtils";
import { dateUtils } from "../../utils/dateUtils";
import {
  listarTurnosSemana,
  crearTurno,
  listarPacientes,
  type Turno,
  type Paciente,
} from "../../lib/firestore";

const HORAS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export function AgendaView({ uid }: { uid: string }) {
  const [semanaInicio, setSemanaInicio] = useState(dateUtils.obtenerInicioDeSemana());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [creando, setCreando] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({
    pacienteId: "",
    pacienteNombre: "",
    fecha: "",
    hora: "",
    estado: "confirmado",
  });
  const [error, setError] = useState("");

  const dias = Array.from({ length: 7 }, (_, i) =>
    dateUtils.sumarDias(semanaInicio, i)
  );

  useEffect(() => {
    cargarTurnos();
    cargarPacientes();
  }, [uid, semanaInicio]);

  const cargarTurnos = async () => {
    try {
      const data = await listarTurnosSemana(uid, semanaInicio);
      setTurnos(data);
    } catch (err) {
      console.warn("No se pudieron cargar los turnos:", err);
    }
  };

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes(uid);
      setPacientes(data);
    } catch (err) {
      console.warn("No se pudieron cargar los pacientes:", err);
    }
  };

  const turnosPorDiaHora = (dia: Date, hora: string) => {
    const inicio = dateUtils.combinarFechaHora(dia, hora);
    const fin = new Date(inicio.getTime() + 50 * 60000);
    return turnos.filter((t) => {
      const tInicio = new Date(t.fecha);
      tInicio.setHours(
        parseInt(t.horaInicio.split(":")[0]),
        parseInt(t.horaInicio.split(":")[1])
      );
      return tInicio >= inicio && tInicio < fin;
    });
  };

  const abrirCrearTurno = () => {
    setCreando(true);
  };

  const cerrarCrearTurno = () => {
    setCreando(false);
    setNuevoTurno({ pacienteId: "", pacienteNombre: "", fecha: "", hora: "", estado: "confirmado" });
    setError("");
  };

  const guardarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nuevoTurno.pacienteId || !nuevoTurno.fecha || !nuevoTurno.hora) {
      setError("Completá paciente, fecha y hora");
      return;
    }
    try {
      const [h, m] = nuevoTurno.hora.split(":").map(Number);
      const fechaObj = new Date(nuevoTurno.fecha);
      fechaObj.setHours(h, m, 0, 0);
      const horaFin = new Date(fechaObj.getTime() + 50 * 60000);

      await crearTurno({
        pacienteId: nuevoTurno.pacienteId,
        uid,
        fecha: fechaObj,
        horaInicio: nuevoTurno.hora,
        horaFin: horaFin.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        duracionMinutos: 50,
        estado: nuevoTurno.estado as any,
        tipo: "individual",
        notasBreves: null,
      });
      await cargarTurnos();
      cerrarCrearTurno();
    } catch (err: any) {
      setError(err.message || "Error al crear el turno");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSemanaInicio(dateUtils.sumarDias(semanaInicio, -7))}>
            <ChevronLeft size={18} />
          </Button>
          <h2 className="text-2xl font-bold text-slate-100">
            {formatUtils.capitalizar(dateUtils.diaSemanaNombre(dias[0].getDay()))},
            {dias[0].getDate()} de{" "}
            {formatUtils.capitalizar(
              ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][dias[0].getMonth()]
            )}
            {" - "}
            {formatUtils.capitalizar(dateUtils.diaSemanaNombre(dias[6].getDay()))},
            {dias[6].getDate()} de{" "}
            {formatUtils.capitalizar(
              ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][dias[6].getMonth()]
            )}
          </h2>
          <Button variant="outline" size="sm" onClick={() => setSemanaInicio(dateUtils.sumarDias(semanaInicio, 7))}>
            <ChevronRight size={18} />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setSemanaInicio(dateUtils.obtenerInicioDeSemana())}
          >
            <RefreshCw size={16} className="mr-1" />
            Hoy
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={abrirCrearTurno}>
            <Plus size={16} className="mr-1" />
            Nuevo turno
          </Button>
        </div>
      </div>

      {creando && (
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Nuevo turno</h3>
          <form onSubmit={guardarTurno} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Paciente</label>
              <select
                value={nuevoTurno.pacienteId}
                onChange={(e) => {
                  const id = e.target.value;
                  const p = pacientes.find((x: Paciente) => x.id === id);
                  setNuevoTurno((prev: typeof nuevoTurno) => ({
                    ...prev,
                    pacienteId: id,
                    pacienteNombre: p ? `${p.nombre} ${p.apellido}` : "",
                  }));
                }}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-primary"
              >
                <option value="">Seleccionar paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id ?? ""}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Fecha</label>
                <Input
                  type="date"
                  value={nuevoTurno.fecha}
                  onChange={(e) => setNuevoTurno((prev: typeof nuevoTurno) => ({ ...prev, fecha: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Hora</label>
                <Input
                  type="time"
                  value={nuevoTurno.hora}
                  onChange={(e) => setNuevoTurno((prev: typeof nuevoTurno) => ({ ...prev, hora: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Estado</label>
              <select
                value={nuevoTurno.estado}
                onChange={(e) => setNuevoTurno((prev: typeof nuevoTurno) => ({ ...prev, estado: e.target.value as "confirmado" | "pendiente" | "cancelado" | "ausente" }))}
                className="w-full h-10 rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-primary"
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            {error && (
              <div className="p-2 rounded bg-red-900/20 border border-red-900/30 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="default">
                Guardar turno
              </Button>
              <Button variant="outline" onClick={cerrarCrearTurno}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dias.map((dia) => (
          <div key={dia.toISOString()} className="border border-slate-700 rounded-xl bg-slate-900/40 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {dateUtils.diaSemanaNombre(dia.getDay())}
                </p>
                <p className="text-xl font-bold text-slate-100">
                  {dia.getDate()}
                </p>
              </div>
              {dateUtils.esHoy(dia) && (
                <Badge variant="secondary">Hoy</Badge>
              )}
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
              {HORAS.map((hora) => {
                const turnosEnCelda = turnosPorDiaHora(dia, hora);
                const turno = turnosEnCelda[0];
                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors ${
                      turno ? "bg-primary/10 border border-primary/30" : "border-transparent hover:border-slate-600"
                    }`}
                  >
                    <span className="text-xs text-slate-500 w-12">{hora}</span>
                    {turno ? (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {turno.pacienteId}
                        </span>
                        <Badge
                          variant={
                            turno.estado === "asistido"
                              ? "default"
                              : turno.estado === "ausente"
                                ? "destructive"
                                : "outline"
                          }
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {turno.estado}
                        </Badge>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 h-1 bg-slate-800/50 rounded" />
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}