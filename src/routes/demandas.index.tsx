import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Plus, Search, Eye, Pencil, Clock, Loader2, AlertTriangle, CheckCircle2, X, Filter, ChevronDown, FileText, Download } from "@/components/icons";
import { KPICard } from "@/components/ui/KPICard";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ContactAutocomplete } from "@/components/ui/ContactAutocomplete";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listDemandas, type Demanda } from "@/lib/demandas.functions";
import { listContatos } from "@/lib/contatos.functions";

export const Route = createFileRoute("/demandas/")({
  head: () => ({
    meta: [
      { title: "Demandas — PRODEM" },
      { name: "description", content: "Acompanhamento de demandas e solicitações do gabinete." },
    ],
  }),
  component: Demandas,
});

type UIDemand = {
  id: string;
  contact: string;
  request: string;
  category: string;
  priority: "Alta" | "Média" | "Baixa";
  status: "pending" | "in-progress" | "waiting" | "done" | "overdue" | "cancelled";
  statusLabel: string;
  date: string;
  raw: Demanda;
};

const STATUS_MAP: Record<string, { variant: UIDemand["status"]; label: string }> = {
  "Pendente": { variant: "pending", label: "Pendente" },
  "Em Andamento": { variant: "in-progress", label: "Em Andamento" },
  "Aguardando Retorno": { variant: "waiting", label: "Aguardando Retorno" },
  "Concluída": { variant: "done", label: "Concluída" },
  "Cancelada": { variant: "cancelled", label: "Cancelada" },
  "Não atendido": { variant: "cancelled", label: "Não atendido" },
};

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

function mapDemand(d: Demanda, index: number): UIDemand {
  const s = STATUS_MAP[d.status] ?? { variant: "pending" as const, label: d.status || "Pendente" };
  const priority = (["Alta", "Média", "Baixa"].includes(d.prioridade) ? d.prioridade : "Média") as UIDemand["priority"];
  const dueDate = d.vencimento || d.dataSolicitacao;
  const isOverdue = !!dueDate && new Date(dueDate) < new Date() && s.variant !== "done" && s.variant !== "cancelled";
  return {
    id: `${index}`,
    contact: d.contato || "-",
    request: d.titulo,
    category: d.categoria || "-",
    priority,
    status: isOverdue ? "overdue" : s.variant,
    statusLabel: isOverdue ? "Atrasada" : s.label,
    date: formatDate(d.dataSolicitacao || d.vencimento),
    raw: d,
  };
}


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
  const listDemFn = useServerFn(listDemandas);
  const listContFn = useServerFn(listContatos);
  const { data: rawDemandas = [] } = useQuery({ queryKey: ["demandas"], queryFn: () => listDemFn() });
  const { data: rawContatos = [] } = useQuery({ queryKey: ["contatos"], queryFn: () => listContFn() });

  const contactById = useMemo(() => {
    const m = new Map<string, string>();
    rawContatos.forEach((c: any) => m.set(c.id, c.nome));
    return m;
  }, [rawContatos]);

  const demands = useMemo(
    () => rawDemandas.map((d, i) => mapDemand(d, i)),
    [rawDemandas],
  );


  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<UIDemand | null>(null);

  const counts = useMemo(() => ({
    pending: demands.filter((d) => d.status === "pending").length,
    inProgress: demands.filter((d) => d.status === "in-progress").length,
    overdue: demands.filter((d) => d.status === "overdue").length,
    done: demands.filter((d) => d.status === "done").length,
  }), [demands]);

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
        <KPICard icon={Clock} value={counts.pending} label="Pendentes" tone="orange" compact />
        <KPICard icon={Loader2} value={counts.inProgress} label="Em Progresso" tone="blue" compact />
        <KPICard icon={AlertTriangle} value={counts.overdue} label="Atrasadas" tone="red" compact />
        <KPICard icon={CheckCircle2} value={counts.done} label="Concluídas" tone="green" compact />
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
            <MultiSelect
              placeholder="Todas"
              options={[
                { value: "oficio", label: "Ofício" },
                { value: "indicacao", label: "Indicação" },
                { value: "requerimento", label: "Requerimento" },
                { value: "emenda", label: "Emenda" },
                { value: "projeto_lei", label: "Projeto de Lei" },
                { value: "mensagem", label: "Mensagem" },
                { value: "saude_exames", label: "Saúde/Exames" },
              ]}
            />
          </FilterField>
          <FilterField label="Prioridade">
            <MultiSelect
              placeholder="Todas"
              options={[
                { value: "alta", label: "Alta" },
                { value: "media", label: "Média" },
                { value: "baixa", label: "Baixa" },
              ]}
            />
          </FilterField>
          <FilterField label="Status">
            <MultiSelect
              placeholder="Todos"
              options={[
                { value: "pendente", label: "Pendente" },
                { value: "em_andamento", label: "Em Andamento" },
                { value: "aguardando", label: "Aguardando Retorno" },
                { value: "concluida", label: "Concluída" },
                { value: "cancelada", label: "Cancelada" },
                { value: "nao_atendido", label: "Não atendido" },
              ]}
            />
          </FilterField>
          <FilterField label="Ordenar por">
            <MultiSelect
              placeholder="Vencimento"
              options={[
                { value: "vencimento", label: "Vencimento" },
                { value: "criacao", label: "Data de criação" },
                { value: "prioridade", label: "Prioridade" },
                { value: "status", label: "Status" },
              ]}
            />
          </FilterField>
          <FilterField label="Tipo Contato">
            <MultiSelect
              placeholder="Todos"
              options={[
                { value: "parlamentar", label: "Parlamentar" },
                { value: "autoridade", label: "Autoridade" },
                { value: "cidadao", label: "Cidadão" },
                { value: "entidade", label: "Entidade" },
                { value: "empresa", label: "Empresa" },
              ]}
            />
          </FilterField>
          <FilterField label="Cidade">
            <MultiSelect placeholder="Todas" options={[]} />
          </FilterField>
          <FilterField label="Bairro">
            <MultiSelect placeholder="Todos" options={[]} />
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
        </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SectionHeader title="Todas as Demandas" count={demands.length} />
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
                      <button onClick={() => setSelectedDemand(d)} aria-label="Visualizar" className="rounded-md p-1.5 text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-strong">
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link to={`/demandas/${d.id}/editar`} aria-label="Editar" className="rounded-md p-1.5 text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-strong">
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedDemand} onOpenChange={(open) => !open && setSelectedDemand(null)}>
        <DialogContent className="max-w-3xl border-slate-200 bg-slate-50 p-0 sm:rounded-2xl">
          {selectedDemand && (
            <>
              <DialogHeader className="border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
                <DialogTitle className="flex items-center gap-2 text-brand-blue">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-normal">Visualização do Relatório</span>
                </DialogTitle>
              </DialogHeader>

              <div className="px-6 py-6 space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-500">ProDEM - Relatório de Demanda</h2>
                  <p className="text-sm text-slate-500 mt-1">Gerado em: 16/07/2026 às 09:53</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Contato</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">{selectedDemand.contact}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Cidade</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">Castanhal</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Título da Demanda</p>
                    <p className="mt-1 text-base font-bold text-slate-800">{selectedDemand.request}</p>
                  </div>
                  <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Categoria</p>
                    <p className="mt-1 text-base text-slate-800">{selectedDemand.category}</p>
                  </div>
                  <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Datas</p>
                    <p className="mt-1 text-sm text-slate-800">Sol: 27/04/2026<br/>Venc: -</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-400">Descrição</p>
                  <p className="mt-1 text-base text-slate-800">Munícipe solicitou uma cesta básica</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-400">Observação</p>
                  <p className="mt-1 text-base text-slate-800">Atendido na recepção por Selma no dia 28/04/2026</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-400">Responsável pela Demanda</p>
                  <p className="mt-1 text-base font-bold text-slate-800">Jhiovana Alcântara</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Data de Criação</p>
                    <p className="mt-1 text-base font-bold text-slate-800">{selectedDemand.date}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Prioridade</p>
                    <p className={`mt-1 font-bold ${selectedDemand.priority === 'Alta' ? 'text-red-500' : selectedDemand.priority === 'Média' ? 'text-orange-500' : 'text-green-500'}`}>
                      {selectedDemand.priority}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Status</p>
                    <p className={`mt-1 font-bold ${selectedDemand.status === 'done' ? 'text-green-500' : 'text-slate-800'}`}>
                      {selectedDemand.statusLabel}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200 bg-slate-50/50 px-6 py-4 rounded-b-2xl flex justify-end gap-2">
                <Button variant="outline" className="rounded-full bg-white text-slate-700 font-normal px-6" onClick={() => setSelectedDemand(null)}>Fechar</Button>
                <Button className="rounded-full bg-[#3b82f6] hover:bg-blue-600 text-white font-normal px-6">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
