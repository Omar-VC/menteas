import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  FileText,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

type Ruta = "dashboard" | "agenda" | "pagos" | "pacientes" | "notas";

const navItems: { ruta: Ruta; label: string; icon: React.ElementType }[] = [
  { ruta: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { ruta: "agenda", label: "Agenda", icon: Calendar },
  { ruta: "pagos", label: "Cobros", icon: CreditCard },
  { ruta: "pacientes", label: "Pacientes", icon: Users },
  { ruta: "notas", label: "Notas clínicas", icon: FileText },
];

export function Sidebar({
  onToggle,
  rutaActiva = "dashboard",
  onNavegar,
}: {
  onToggle?: () => void;
  rutaActiva?: Ruta;
  onNavegar?: (ruta: Ruta) => void;
}) {
  const [collapsed] = useState(false);
  const { logout } = useAuth();

  const asideClasses = `fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300 ${collapsed ? "translate-x-[-256px] md:translate-x-0" : "w-64 md:w-64 translate-x-0"}`;

  return (
    <aside className={asideClasses}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className={collapsed ? "hidden" : "font-bold text-xl tracking-tight text-white"}>
            Menteas
          </span>
        </div>
        <button
          onClick={onToggle}
          className="md:hidden p-2 text-slate-400 hover:text-white"
        >
          {collapsed ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activo = item.ruta === rutaActiva;
          const btnClasses = `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activo ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"}`;
          return (
            <button
              key={item.ruta}
              onClick={() => onNavegar?.(item.ruta)}
              className={btnClasses}
            >
              <Icon size={18} className="shrink-0" />
              {collapsed ? null : <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {collapsed ? null : <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
