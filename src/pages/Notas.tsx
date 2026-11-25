import { useState, useEffect } from "react";
import { NotesList } from "../components/notas/NotesList";
import { NoteEditor } from "../components/notas/NoteEditor";
import { Card } from "../components/ui/Card";
import { FileText, Plus } from "lucide-react";
import { listarPacientes } from "../lib/firestore";
import { type Paciente } from "../types/index";

export function NotasPage({ uid }: { uid: string }) {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [modo, setModo] = useState<"lista" | "editor">("lista");

  useEffect(() => {
    cargarPacientes();
  }, [uid]);

  const cargarPacientes = async () => {
    try {
      const data = await listarPacientes(uid);
      setPacientes(data);
    } catch (err) {
      console.warn("No se pudieron cargar pacientes:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Notas clínicas</h1>
        <button
          onClick={() => {
            if (pacientes.length > 0) {
              setPacienteSeleccionado(pacientes[0].id ?? "");
              setModo("editor");
            }
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/40 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Nueva nota
        </button>
      </div>

      {modo === "editor" && pacienteSeleccionado ? (
        <NoteEditor
          uid={uid}
          pacienteId={pacienteSeleccionado}
          onCerrar={() => {
            setModo("lista");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NotesList
              uid={uid}
              onVerNota={() => {
                setModo("editor");
              }}
            />
          </div>
          <div className="hidden lg:block">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Seleccionar paciente</h3>
              <div className="space-y-2">
                {pacientes.length === 0 ? (
                  <p className="text-xs text-slate-500">No hay pacientes aún.</p>
                ) : (
                  pacientes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPacienteSeleccionado(p.id ?? "");
                        setModo("editor");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-700 bg-slate-900/40 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                          {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                        </div>
                        <span>{p.nombre} {p.apellido}</span>
                      </div>
                      <FileText size={14} className="text-slate-500" />
                    </button>
                  ))
                )}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Seleccioná un paciente para crear o ver sus notas.
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}