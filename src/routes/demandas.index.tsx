import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Plus, Search, Eye, Pencil, Clock, Loader2, AlertTriangle, CheckCircle2, X, Filter, ChevronDown } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const Route = createFileRoute("/demandas/")({
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

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}


function priorityVariant(p: "Alta" | "Média" | "Baixa") {
  return p === "Alta" ? "priority-high" : p === "Média" ? "priority-medium" : "priority-low";
}

function Demandas() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  return (
    <AppLayout>
      <PageHeader
        icon={ClipboardList}
        title="Demandas"
        subtitle="Registro e acompanhamento das solicitações dos cidadãos"
        action={
          <Link
            to="/demandas/novo"
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nova Demanda
          </Link>
        }
      />

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard icon={Clock} value={1} label="Pendentes" tone="orange" compact />
        <KPICard icon={Loader2} value={2} label="Em Progresso" tone="blue" compact />
        <KPICard icon={AlertTriangle} value={1} label="Atrasadas" tone="red" compact />
        <KPICard icon={CheckCircle2} value={1} label="Concluídas" tone="green" compact />
      </div>

      <div className="mb-3 rounded-2xl bg-navy-800 p-5 shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="filters-panel"
          className={`flex w-full items-center justify-between gap-2 text-white transition-colors hover:text-brand-orange ${filtersOpen ? "mb-4" : ""}`}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-semibold">Filtros</span>
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>

        {filtersOpen && (
        <div id="filters-panel" className="space-y-3">
        <ContactAutocomplete
          placeholder="Buscar por código, nome, email ou telefone…"
          options={demands.map((d) => ({
            value: String(d.id),
            label: d.request,
            sublabel: `#${d.id} • ${d.contact}`,
          }))}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <FilterField label="Data Inicial">
            <input
              type="date"
              className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </FilterField>
          <FilterField label="Data Final">
            <input
              type="date"
              className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </FilterField>
          <FilterField label="Categoria">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Todas</option>
              <option>Ofício</option>
              <option>Indicação</option>
              <option>Requerimento</option>
              <option>Emenda</option>
              <option>Projeto de Lei</option>
              <option>Mensagem</option>
              <option>Saúde/Exames</option>
            </select>
          </FilterField>
          <FilterField label="Prioridade">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Todas</option>
              <option>Alta</option>
              <option>Média</option>
              <option>Baixa</option>
            </select>
          </FilterField>
          <FilterField label="Status">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Todos</option>
              <option>Pendente</option>
              <option>Em Andamento</option>
              <option>Aguardando Retorno</option>
              <option>Concluída</option>
              <option>Cancelada</option>
              <option>Não atendido</option>
            </select>
          </FilterField>
          <FilterField label="Ordenar por">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Vencimento</option>
              <option>Data de criação</option>
              <option>Prioridade</option>
              <option>Status</option>
            </select>
          </FilterField>
          <FilterField label="Tipo Contato">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Todos</option>
              <option>Parlamentar</option>
              <option>Autoridade</option>
              <option>Cidadão</option>
              <option>Entidade</option>
              <option>Empresa</option>
            </select>
          </FilterField>
          <FilterField label="Cidade">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Todas</option>
            </select>
          </FilterField>
          <FilterField label="Bairro">
            <select className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>Todos</option>
            </select>
          </FilterField>
          <div className="flex items-end gap-2">
            <button
              type="button"
              aria-label="Aplicar filtros"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white transition-transform hover:brightness-110 active:scale-95"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Limpar filtros"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-500 text-white transition-transform hover:brightness-110 active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        )}
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
