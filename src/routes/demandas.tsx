import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Plus, Search, Eye, Pencil, Clock, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const Route = createFileRoute("/demandas")({
  head: () => ({
    meta: [
      { title: "Demandas — PRODEM" },
      { name: "description", content: "Acompanhamento de demandas e solicitações do gabinete." },
    ],
  }),
  component: Demandas,
});

const demands = [
  { id: 101, contact: "José Almeida", request: "Apoio financeiro para tratamento", category: "Ofício", priority: "Média" as const, status: "in-progress" as const, statusLabel: "Em Andamento", date: "07/07/2026" },
  { id: 102, contact: "Ana Ribeiro", request: "Kit enxoval maternidade", category: "Indicação", priority: "Alta" as const, status: "pending" as const, statusLabel: "Pendente", date: "06/07/2026" },
  { id: 103, contact: "Carlos Souza", request: "Iluminação pública Rua das Palmeiras", category: "Requerimento", priority: "Média" as const, status: "waiting" as const, statusLabel: "Aguardando Retorno", date: "05/07/2026" },
  { id: 104, contact: "Fernanda Lima", request: "Agendamento exame cardiológico", category: "Saúde/Exames", priority: "Alta" as const, status: "done" as const, statusLabel: "Concluída", date: "04/07/2026" },
  { id: 105, contact: "Roberto Nunes", request: "Emenda para reforma da escola", category: "Emenda", priority: "Média" as const, status: "in-progress" as const, statusLabel: "Em Andamento", date: "03/07/2026" },
  { id: 106, contact: "Patrícia Gomes", request: "Projeto de lei — mobilidade urbana", category: "Projeto de Lei", priority: "Baixa" as const, status: "overdue" as const, statusLabel: "Atrasada", date: "01/07/2026" },
  { id: 107, contact: "Luiz Henrique", request: "Mensagem de apoio institucional", category: "Mensagem", priority: "Baixa" as const, status: "cancelled" as const, statusLabel: "Cancelada", date: "28/06/2026" },
];

function priorityVariant(p: "Alta" | "Média" | "Baixa") {
  return p === "Alta" ? "priority-high" : p === "Média" ? "priority-medium" : "priority-low";
}

function Demandas() {
  return (
    <AppLayout>
      <PageHeader
        icon={ClipboardList}
        title="Demandas"
        subtitle="Registro e acompanhamento das solicitações dos cidadãos"
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Nova Demanda
          </button>
        }
      />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard icon={Clock} value={1} label="Pendentes" tone="orange" />
        <KPICard icon={Loader2} value={2} label="Em Progresso" tone="blue" />
        <KPICard icon={AlertTriangle} value={1} label="Atrasadas" tone="red" />
        <KPICard icon={CheckCircle2} value={1} label="Concluídas" tone="green" />
      </div>

      <div className="mb-6 rounded-2xl bg-navy-800 p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px_180px_auto]">
          <input
            type="text"
            placeholder="Buscar demanda ou contato…"
            className="rounded-lg border-0 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <select className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option>Todos os status</option>
            <option>Pendente</option>
            <option>Em Andamento</option>
            <option>Concluída</option>
          </select>
          <select className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option>Todas as categorias</option>
            <option>Ofício</option>
            <option>Emenda</option>
          </select>
          <select className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option>Prioridade</option>
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
          </select>
          <button
            aria-label="Buscar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white transition-transform hover:brightness-110 active:scale-95"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SectionHeader title="Todas as Demandas" count={7} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">#</th>
                <th className="px-5 py-3 text-left font-semibold">Contato</th>
                <th className="px-5 py-3 text-left font-semibold">Demanda</th>
                <th className="px-5 py-3 text-left font-semibold">Categoria</th>
                <th className="px-5 py-3 text-left font-semibold">Prioridade</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Data</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {demands.map((d) => (
                <tr key={d.id} className="border-t border-border transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">#{d.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-foreground">{d.contact}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{d.request}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-brand-blue" />
                      {d.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant={priorityVariant(d.priority)}>{d.priority}</StatusBadge>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant={d.status}>{d.statusLabel}</StatusBadge>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{d.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button aria-label="Visualizar" className="rounded-md p-1.5 text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-strong">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button aria-label="Editar" className="rounded-md p-1.5 text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-strong">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
