import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Plus,
  X,
  Save,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { dateUtils } from "../../utils/dateUtils";
import {
  crearNota,
  listarPacientes,
} from "../../lib/firestore";
import { type TareaPendiente } from "../../types/index";

export interface TareaEditor {
  id: string;
  texto: string;
  completada: boolean;
  fechaVencimiento: Date | null;
}

export function NoteEditor({
  uid,
  pacienteId,
  onGuardar,
  onCerrar,
}: {
  uid: string;
  pacienteId: string;
  onGuardar?: () => void;
  onCerrar: () => void;
}) {
  const [tipo, setTipo] = useState("evolucion");
  const [contenido, setContenido] = useState("");
  const [tareas, setTareas] = useState<TareaEditor[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [nombrePaciente, setNombrePaciente] = useState("");

  useEffect(() => {
    cargarPacientes();
  }, [uid]);

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes(uid);
      const p = data.find((x) => x.id === pacienteId);
      if (p) setNombrePaciente(`${p.nombre} ${p.apellido}`);
    } catch (err) {
      console.warn("No se pudieron cargar pacientes:", err);
    }
  };

  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;
    setTareas([
      ...tareas,
      { id: crypto.randomUUID(), texto: nuevaTarea.trim(), completada: false, fechaVencimiento: null },
    ]);
    setNuevaTarea("");
  };

  const toggleTarea = (id: string) => {
    setTareas(
      tareas.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
    );
  };

  const eliminarTarea = (id: string) => {
    setTareas(tareas.filter((t) => t.id !== id));
  };

  const tipos = [
    { value: "evolucion", label: "Evolución" },
    { value: "sesion", label: "Sesión" },
    { value: "recordatorio", label: "Recordatorio" },
    { value: "plan", label: "Plan de tratamiento" },
  ];

  const handleGuardar = async () => {
    if (!contenido.trim()) {
      setError("Escribí el contenido de la nota");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const tareasPendientes: TareaPendiente[] = tareas.map((t) => ({
        id: t.id,
        texto: t.texto,
        completada: t.completada,
        fechaVencimiento: t.fechaVencimiento,
      }));
      await crearNota({
        pacienteId,
        uid,
        turnoId: null,
        fecha: new Date(),
        tipo: tipo as any,
        contenido,
        tareasPendientes,
      });
      if (onGuardar) onGuardar();
    } catch (err: any) {
      setError(err.message || "Error al guardar la nota");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100">
          Nota clínica - {nombrePaciente || pacienteId}
        </h3>
        <Button variant="outline" size="sm" onClick={onCerrar}>
          <X size={16} className="mr-1" />
          Cerrar
        </Button>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-900/20 border border-red-900/30 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400">Tipo de nota</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="h-10 rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-primary"
          >
            {tipos.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-400">Fecha</label>
          <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-400">Contenido de la nota</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          className="w-full min-h-[200px] rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-primary"
          placeholder="Escribí aquí la evolución de la sesión..."
        />
      </div>

      <div className="border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-200">
            Tareas pendientes ({tareas.filter((t) => !t.completada).length})
          </h4>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nueva tarea (ej. preparar material)"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarTarea()}
            />
            <Button variant="outline" size="sm" onClick={agregarTarea}>
              <Plus size={14} className="mr-1" />
              Agregar
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          {tareas.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-1.5">
              <button
                onClick={() => toggleTarea(t.id)}
                className={`w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center transition-colors ${t.completada ? "bg-primary text-primary-foreground border-primary" : "bg-transparent"}`}
              >
                {t.completada && <CheckCircle2 size={14} strokeWidth={0} fill="currentColor" />}
              </button>
              <span className={`text-sm flex-1 ${t.completada ? "line-through text-slate-500" : "text-slate-200"}`}>
                {t.texto}
              </span>
              <button
                onClick={() => eliminarTarea(t.id)}
                className="p-1 text-red-500 hover:bg-red-900/20 rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Última actualización: {dateUtils.formatearFecha(new Date())}
        </div>
        <Button onClick={handleGuardar} disabled={guardando}>
          <Save size={16} className="mr-1" />
          {guardando ? "Guardando..." : "Guardar nota"}
        </Button>
      </div>
    </div>
  );
}