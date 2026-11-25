import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <main className="md:pl-64 pt-16 p-4">{children}</main>
    </div>
  );
}