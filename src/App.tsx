import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { Sidebar } from "./components/layout/Sidebar";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AgendaPage } from "./pages/Agenda";
import { NotasPage } from "./pages/Notas";
import { PacientesPage } from "./pages/Pacientes";
import { PagosPage } from "./pages/Pagos";

type Ruta = "dashboard" | "agenda" | "pagos" | "pacientes" | "notas";

const RUTA_LABEL: Record<Ruta, string> = {
  dashboard: "Dashboard",
  agenda: "Agenda",
  pagos: "Cobros",
  pacientes: "Pacientes",
  notas: "Notas clínicas",
};

function App() {
  const { user, profesional, loading } = useAuth();
  const [ruta, setRuta] = useState<Ruta>("dashboard");

  useEffect(() => {
    if (!loading && !user) {
      setRuta("dashboard");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => {}} />;
  }

  const uid = profesional?.uid ?? user.uid;

  const PaginaActual = () => {
    switch (ruta) {
      case "agenda":
        return <AgendaPage uid={uid} />;
      case "notas":
        return <NotasPage uid={uid} />;
      case "pacientes":
        return <PacientesPage uid={uid} />;
      case "pagos":
        return <PagosPage uid={uid} />;
      case "dashboard":
      default:
        return <Dashboard uid={uid} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        onToggle={() => {}}
        rutaActiva={ruta}
        onNavegar={(r) => setRuta(r)}
      />
      <div className="flex flex-col h-screen">
        <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => {}}
            >
              <span className="sr-only">Menú</span>
              <div className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-100 hidden md:block">
              {RUTA_LABEL[ruta]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors">
              <span className="text-slate-400">{user.email}</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-white">
              <div className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:pl-64">
          <PaginaActual />
        </main>
      </div>
    </div>
  );
}

export default App;