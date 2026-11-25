import { useState, useEffect } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Search, User, Clock, Phone } from "lucide-react";
import { dateUtils } from "../utils/dateUtils";
import {
  listarPacientes,
  crearPaciente,
} from "../lib/firestore";
import { type Paciente, type HorarioFijo } from "../types/index";

export function PacientesPage({ uid }: { uid: string }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [query, setQuery] = useState("");
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    motivoConsulta: "",
    horariosFijos: [] as HorarioFijo[],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    cargarPacientes();
  }, [uid]);

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes(uid);
      setPacientes(data);
    } catch (err) {
      console.warn("No se pudieron cargar los pacientes:", err);
    }
  };

  const filtrados = pacientes.filter(
    (p) =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(query.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const handleCrearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nuevo.nombre || !nuevo.apellido) {
      setError("Nombre y apellido son obligatorios");
      return;
    }
    try {
      await crearPaciente({
        uid,
        nombre: nuevo.nombre,
        apellido: nuevo.apellido,
        email: nuevo.email || null,
        telefono: nuevo.telefono || null,
        fechaNacimiento: null,
        direccion: null,
        obraSocial: null,
        motivoConsulta: nuevo.motivoConsulta || null,
        fechaAlta: new Date(),
        activo: true,
        horariosFijos: nuevo.horariosFijos,
      });
      await cargarPacientes();
      setCreando(false);
      setNuevo({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        motivoConsulta: "",
        horariosFijos: [],
      });
    } catch (err: any) {
      setError(err.message || "Error al crear paciente");
    }
  };

  const agregarHorario = () => {
    setNuevo((prev) => ({
      ...prev,
      horariosFijos: [
        ...prev.horariosFijos,
        { diaSemana: 1 as any, hora: "09:00", duracionMinutos: 50, activo: true },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Pacientes</h1>
        <Button variant="default" onClick={() => setCreando(true)}>
          <User size={18} className="mr-1" />
          Nuevo paciente
        </Button>
      </div>

      {creando && (
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Nuevo paciente</h3>
          {error && (
            <div className="mb-3 p-2 rounded bg-red-900/20 border border-red-900/30 text-sm text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleCrearPaciente} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Nombre</label>
                <Input
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Apellido</label>
                <Input
                  value={nuevo.apellido}
                  onChange={(e) => setNuevo((prev) => ({ ...prev, apellido: e.target.value }))}
                  placeholder="Apellido"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Email</label>
              <Input
                type="email"
                value={nuevo.email}
                onChange={(e) => setNuevo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="paciente@email.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Teléfono</label>
              <Input
                value={nuevo.telefono}
                onChange={(e) => setNuevo((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Motivo de consulta</label>
              <Input
                value={nuevo.motivoConsulta}
                onChange={(e) => setNuevo((prev) => ({ ...prev, motivoConsulta: e.target.value }))}
                placeholder="Ansiedad, depresión, etc."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Horarios fijos</label>
              <button type="button" onClick={agregarHorario} className="text-sm text-primary underline mb-2">
                + Agregar horario fijo
              </button>
              {nuevo.horariosFijos.map((h, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <select
                    value={h.diaSemana}
                    onChange={(e) => {
                      const arr = [...nuevo.horariosFijos];
                      arr[i].diaSemana = parseInt(e.target.value) as any;
                      setNuevo((prev) => ({ ...prev, horariosFijos: arr }));
                    }}
                    className="h-9 rounded border border-slate-600 bg-slate-950 px-2 text-xs text-slate-100"
                  >
                    <option value={1 as any}>Lunes</option>
                    <option value={2 as any}>Martes</option>
                    <option value={3 as any}>Miércoles</option>
                    <option value={4 as any}>Jueves</option>
                    <option value={5 as any}>Viernes</option>
                  </select>
                  <Input
                    type="time"
                    value={h.hora}
                    onChange={(e) => {
                      const arr = [...nuevo.horariosFijos];
                      arr[i].hora = e.target.value;
                      setNuevo((prev) => ({ ...prev, horariosFijos: arr }));
                    }}
                    className="h-9 rounded border border-slate-600 bg-slate-950 px-2 text-xs text-slate-100 w-24"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit">Guardar paciente</Button>
              <Button variant="outline" type="button" onClick={() => setCreando(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Buscar por nombre, apellido o email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.length === 0 ? (
          <div className="col-span-3 p-6 text-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30">
            <p className="text-sm text-slate-400">No se encontraron pacientes.</p>
          </div>
        ) : (
          filtrados.map((p) => (
            <Card key={p.id} className="p-4 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-100">
                      {p.nombre} {p.apellido}
                    </h3>
                    <p className="text-xs text-slate-500">{p.email ?? "Sin email"}</p>
                  </div>
                </div>
                <Badge
                  variant={p.activo ? "default" : "outline"}
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone size={14} /> {p.telefono ?? "Sin teléfono"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} /> Alta: {dateUtils.formatearFecha(p.fechaAlta)}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); }}>
                  Ver ficha
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); }}>
                  Agendar turno
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}