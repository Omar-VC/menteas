import { useState, useEffect } from "react";
import {
  Search,
  FileText,
  Clock,
  Plus,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { dateUtils } from "../../utils/dateUtils";
import { formatUtils } from "../../utils/formatUtils";
import {
  listarNotasPorUsuario,
  type NotaClinica,
} from "../../lib/firestore";

export function NotesList({
  uid,
  pacienteId,
  onVerNota,
}: {
  uid: string;
  pacienteId?: string;
  onVerNota: (id: string) => void;
}) {
  const [notas, setNotas] = useState<NotaClinica[]>([]);
  const [query, setQuery] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    cargarNotas();
  }, [uid, pacienteId]);

  const cargarNotas = async () => {
    try {
      if (pacienteId) {
        const { listarNotasPorPaciente } = await import("../../lib/firestore");
        const data = await listarNotasPorPaciente(pacienteId);
        setNotas(data);
      } else {
        const data = await listarNotasPorUsuario(uid);
        setNotas(data);
      }
    } catch (err) {
      console.warn("No se pudieron cargar las notas:", err);
    }
  };

  const filtradas = notas.filter(
    (n) =>
      n.pacienteId.toLowerCase().includes(query.toLowerCase()) &&
      (filtroTipo === "todos" || n.tipo === filtroTipo)
  );

  return (
    <div className="space-y-4">
      {!pacienteId && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Buscar notas o pacientes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFiltroTipo("todos")}>
              Todos
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFiltroTipo("recordatorio")}>
              Recordatorios
            </Button>
            <Button variant="default" size="sm" onClick={() => setCreando(true)}>
              <Plus size={14} className="mr-1" />
              Nueva nota
            </Button>
          </div>
        </div>
      )}

      {creando && !pacienteId && (
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60 mb-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Nueva nota clínica</h3>
          <p className="text-sm text-slate-400 mb-3">
            Seleccioná un paciente desde la lista de pacientes para crear su primera nota.
          </p>
          <Button variant="outline" onClick={() => setCreando(false)}>
            Volver
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {filtradas.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30">
            <FileText size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">
              {!pacienteId ? "No se encontraron notas clínicas." : "Este paciente no tiene notas aún."}
            </p>
          </div>
        ) : (
          filtradas.map((nota) => (
            <Card key={nota.id} className="cursor-pointer hover:border-primary/50 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-300">
                      {formatUtils.capitalizar(nota.tipo)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {dateUtils.formatearFecha(nota.fecha)}
                    </span>
                  </div>
                  <h4 className="font-medium text-slate-100 group-hover:text-primary transition-colors">
                    Paciente {nota.pacienteId.slice(0, 8)}
                  </h4>
                  <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                    {nota.contenido}
                  </p>
                  {nota.tareasPendientes && nota.tareasPendientes.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Clock size={14} className="text-amber-500" />
                      <span className="text-xs text-amber-400 font-medium">
                        {nota.tareasPendientes.filter((t) => !t.completada).length} tarea pendiente
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {nota.tareasPendientes && nota.tareasPendientes.some((t) => !t.completada) ? "Pendiente" : "Listo"}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerNota(nota.id ?? "");
                    }}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}