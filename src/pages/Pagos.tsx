import { useState, useEffect } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Search, CreditCard, User, Plus, RefreshCw } from "lucide-react";
import {
  listarPagosPorUsuario,
  crearPago,
  actualizarPago,
  eliminarPago,
  listarPacientes,
} from "../lib/firestore";
import { type Pago, type EstadoPago, type Paciente } from "../types/index";
import { dateUtils } from "../utils/dateUtils";

const ESTADOS_PAGO: { value: EstadoPago; label: string; variant: "default" | "secondary" | "destructive" | "outline" }[] = [
  { value: "pagado", label: "Pagado", variant: "default" },
  { value: "pendiente", label: "Pendiente", variant: "destructive" },
  { value: "adelantado", label: "Adelantado", variant: "secondary" },
];

export function PagosPage({ uid }: { uid: string }) {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPago | "todos">("todos");
  const [creando, setCreando] = useState(false);
  const [nuevoPago, setNuevoPago] = useState<{
    pacienteId: string;
    pacienteNombre: string;
    monto: string;
    fecha: string;
    estado: EstadoPago;
    metodo: "efectivo" | "transferencia" | "tarjeta" | "otro";
    comprobanteUrl: string;
    turnoId: string;
  }>({
    pacienteId: "",
    pacienteNombre: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "pendiente",
    metodo: "efectivo",
    comprobanteUrl: "",
    turnoId: "",
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [uid, filtroEstado]);

  const cargarDatos = async () => {
    try {
      const [p, pa] = await Promise.all([
        listarPagosPorUsuario(uid),
        listarPacientes(uid),
      ]);
      setPagos(p);
      setPacientes(pa);
    } catch (err) {
      console.warn("No se pudieron cargar los pagos:", err);
      setError("No se pudieron cargar los pagos desde Firestore.");
    }
  };

  const filtrados = pagos.filter((pago) => {
    const paciente = pacientes.find((p) => p.id === pago.pacienteId);
    const nombre = paciente ? `${paciente.nombre} ${paciente.apellido}` : pago.pacienteId;
    const coincideNombre = nombre.toLowerCase().includes(query.toLowerCase());
    const coincideEstado = filtroEstado === "todos" || pago.estado === filtroEstado;
    return coincideNombre && coincideEstado;
  });

  const totalPendiente = filtrados
    .filter((p) => p.estado === "pendiente")
    .reduce((acc, p) => acc + p.monto, 0);

  const totalPagado = filtrados
    .filter((p) => p.estado === "pagado")
    .reduce((acc, p) => acc + p.monto, 0);

  const abrirCrearPago = () => {
    setCreando(true);
    setError("");
    setNuevoPago({
      pacienteId: "",
      pacienteNombre: "",
      monto: "",
      fecha: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      metodo: "efectivo",
      comprobanteUrl: "",
      turnoId: "",
    });
  };

  const cerrarCrearPago = () => {
    setCreando(false);
    setError("");
  };

  const guardarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nuevoPago.pacienteId || !nuevoPago.monto || !nuevoPago.fecha) {
      setError("Completá paciente, monto y fecha");
      return;
    }
    const montoNum = parseFloat(nuevoPago.monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }
    setGuardando(true);
    try {
      await crearPago({
        turnoId: nuevoPago.turnoId || null,
        pacienteId: nuevoPago.pacienteId,
        uid,
        monto: montoNum,
        fecha: new Date(nuevoPago.fecha),
        estado: nuevoPago.estado,
        metodo: nuevoPago.metodo,
        comprobanteUrl: nuevoPago.comprobanteUrl || null,
      });
      await cargarDatos();
      cerrarCrearPago();
    } catch (err: any) {
      setError(err.message || "Error al registrar el cobro");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (pagoId: string, nuevoEstado: EstadoPago) => {
    try {
      await actualizarPago(pagoId, { estado: nuevoEstado });
      await cargarDatos();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el estado");
    }
  };

  const borrarPago = async (pagoId: string) => {
    if (!confirm("¿Eliminar este cobro?")) return;
    try {
      await eliminarPago(pagoId);
      await cargarDatos();
    } catch (err: any) {
      setError(err.message || "Error al eliminar el cobro");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Cobros</h1>
          <p className="text-slate-400">
            Control de pagos y cobros por sesión.
          </p>
        </div>
        <Button variant="default" onClick={abrirCrearPago}>
          <Plus size={18} className="mr-1" />
          Nuevo cobro
        </Button>
      </div>

      {creando && (
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Nuevo cobro</h3>
          {error && (
            <div className="mb-3 p-2 rounded bg-red-900/20 border border-red-900/30 text-sm text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={guardarPago} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Paciente</label>
              <select
                value={nuevoPago.pacienteId}
                onChange={(e) => {
                  const id = e.target.value;
                  const p = pacientes.find((x) => x.id === id);
                  setNuevoPago((prev) => ({
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Monto ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={nuevoPago.monto}
                  onChange={(e) => setNuevoPago((prev) => ({ ...prev, monto: e.target.value }))}
                  placeholder="15000"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Fecha</label>
                <Input
                  type="date"
                  value={nuevoPago.fecha}
                  onChange={(e) => setNuevoPago((prev) => ({ ...prev, fecha: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Estado</label>
                <select
                  value={nuevoPago.estado}
                  onChange={(e) => setNuevoPago((prev) => ({ ...prev, estado: e.target.value as EstadoPago }))}
                  className="w-full h-10 rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-primary"
                >
                  {ESTADOS_PAGO.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-400">Método</label>
                <select
                  value={nuevoPago.metodo}
                  onChange={(e) => setNuevoPago((prev) => ({ ...prev, metodo: e.target.value as "efectivo" | "transferencia" | "tarjeta" | "otro" }))}
                  className="w-full h-10 rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-slate-100 focus:ring-1 focus:ring-primary"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Turno asociado (opcional)</label>
              <Input
                placeholder="ID del turno o dejar vacío"
                value={nuevoPago.turnoId}
                onChange={(e) => setNuevoPago((prev) => ({ ...prev, turnoId: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="default" disabled={guardando}>
                {guardando ? "Registrando..." : "Registrar cobro"}
              </Button>
              <Button variant="outline" type="button" onClick={cerrarCrearPago}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total pendiente</p>
          <p className="text-2xl font-bold text-amber-400">
            $ {totalPendiente.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total cobrado</p>
          <p className="text-2xl font-bold text-green-400">
            $ {totalPagado.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Cobros listados</p>
          <p className="text-2xl font-bold text-slate-100">{filtrados.length}</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Buscar paciente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={() => setFiltroEstado("todos")}>
          Todos
        </Button>
        {ESTADOS_PAGO.map((e) => (
          <Button
            key={e.value}
            variant="outline"
            size="sm"
            onClick={() => setFiltroEstado(e.value)}
            className={filtroEstado === e.value ? "bg-primary/10 text-primary border-primary" : ""}
          >
            {e.label}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => cargarDatos()}>
          <RefreshCw size={16} className="mr-1" />
          Actualizar
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-xs uppercase text-slate-500">
              <th className="pb-3 font-semibold">Paciente</th>
              <th className="pb-3 font-semibold">Monto</th>
              <th className="pb-3 font-semibold">Fecha</th>
              <th className="pb-3 font-semibold">Estado</th>
              <th className="pb-3 font-semibold">Método</th>
              <th className="pb-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-500">
                  No se encontraron cobros.
                </td>
              </tr>
            ) : (
              filtrados.map((pago) => {
                const paciente = pacientes.find((p) => p.id === pago.pacienteId);
                const nombre = paciente ? `${paciente.nombre} ${paciente.apellido}` : pago.pacienteId;
                const estadoConf = ESTADOS_PAGO.find((e) => e.value === pago.estado);
                return (
                  <tr key={pago.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                          {paciente?.nombre.charAt(0) ?? "?"}{paciente?.apellido.charAt(0) ?? "?"}
                        </div>
                        <span className="text-sm text-slate-200">{nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-medium text-slate-100">
                      $ {pago.monto.toLocaleString("es-AR")}
                    </td>
                    <td className="py-3 text-sm text-slate-400">
                      {dateUtils.formatearFecha(pago.fecha)}
                    </td>
                    <td className="py-3">
                      <Badge variant={estadoConf?.variant ?? "outline"}>
                        {estadoConf?.label ?? pago.estado}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-slate-400 capitalize">
                      {pago.metodo}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center gap-1">
                        {pago.estado !== "pagado" && (
                          <button
                            onClick={() => cambiarEstado(pago.id!, "pagado")}
                            className="p-1 text-green-400 hover:bg-green-900/20 rounded transition-colors"
                            title="Marcar como pagado"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        {pago.estado !== "pendiente" && (
                          <button
                            onClick={() => cambiarEstado(pago.id!, "pendiente")}
                            className="p-1 text-amber-400 hover:bg-amber-900/20 rounded transition-colors"
                            title="Marcar como pendiente"
                          >
                            <CreditCard size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => borrarPago(pago.id!)}
                          className="p-1 text-red-500 hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar cobro"
                        >
                          <User size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}