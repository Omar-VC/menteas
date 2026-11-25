import { AgendaView } from "../components/agenda/AgendaView";

export function AgendaPage({ uid }: { uid: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Agenda semanal</h1>
      <AgendaView uid={uid} />
    </div>
  );
}