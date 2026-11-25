import { useState } from "react";
import { Bell, Sun, Search, User } from "lucide-react";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-400 hover:text-white"
          >
            <div className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                placeholder="Buscar paciente..."
                className="h-9 pl-9 pr-3 rounded-lg border border-slate-700 bg-slate-950 text-xs text-slate-100 placeholder:text-slate-500 focus:ring-1 focus:ring-primary w-48"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-white"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors">
            <User size={16} />
            <span>Psicólogo</span>
          </button>
          <button className="p-2 text-slate-400 hover:text-white">
            <Sun size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}