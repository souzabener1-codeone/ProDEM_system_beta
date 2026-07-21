import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, Plus, Search, Eye, Pencil, Clock, Loader2, AlertTriangle, CheckCircle2, X, Filter, ChevronDown, FileText, Download, FileDown, FileSpreadsheet } from "@/components/icons";
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
import { exportListToPdf } from "@/lib/export/exportPdf";
import { exportListToExcel } from "@/lib/export/exportExcel";
import { buildFilename } from "@/lib/export/filename";

const DEMANDA_COLUMNS = [
  { header: "Título", key: "titulo", width: 1.6 },
  { header: "Categoria", key: "categoria", width: 1 },
  { header: "Contato", key: "contato", width: 1.4 },
  { header: "Cidade", key: "cidade", width: 1 },
  { header: "Descrição", key: "descricao", width: 2.2 },
  { header: "Data Solicitação", key: "dataSolicitacao", width: 1 },
  { header: "Vencimento", key: "vencimento", width: 1 },
  { header: "Observações", key: "observacoes", width: 2 },
];

function parseISOLocal(iso: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + "T00:00:00") : new Date(iso);
}

function formatBRDate(iso: string): string {
  if (!iso) return "-";
  const d = parseISOLocal(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}


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
  priority: string;
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
  const d = parseISOLocal(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}


function mapDemand(d: Demanda, index: number): UIDemand {
  const s = STATUS_MAP[d.status] ?? { variant: "pending" as const, label: d.status || "Pendente" };
  const priority = (["Alta", "Média", "Baixa"].includes(d.prioridade) ? d.prioridade : (d.prioridade || "-")) as UIDemand["priority"];
  return {
    id: `${index}`,
    contact: d.contato || "-",
    request: d.titulo,
    category: d.categoria || "-",
    priority,
    status: s.variant,
    statusLabel: s.label,
    date: formatDate(d.dataSolicitacao),
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


function priorityVariant(p: string) {
  return p === "Alta" ? "priority-high" : p === "Média" ? "priority-medium" : p === "Baixa" ? "priority-low" : "priority-low";
}

function Demandas() {
  const listDemFn = useServerFn(listDemandas);
  const listContFn = useServerFn(listContatos);
  const { data: rawDemandas = [] } = useQuery({ queryKey: ["demandas"], queryFn: () => listDemFn() });
  const { data: rawContatos = [] } = useQuery({ queryKey: ["contatos"], queryFn: () => listContFn() });

  const cityByContact = useMemo(() => {
    const m = new Map<string, string>();
    rawContatos.forEach((c: any) => {
      const cidade = (c.localizacao || "").split("/")[0]?.trim() || "";
      if (c.nome) m.set(String(c.nome).toLowerCase(), cidade);
      if (c.codigo) m.set(String(c.codigo).toLowerCase(), cidade);
    });
    return m;
  }, [rawContatos]);

  const demands = useMemo(
    () => rawDemandas.map((d, i) => mapDemand(d, i)),
    [rawDemandas],
  );



  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<UIDemand | null>(null);

  type FilterState = {
    search: string;
    dataInicial: string;
    dataFinal: string;
    categoria: string[];
    prioridade: string[];
    status: string[];
    ordenar: string[];
    tipoContato: string[];
    cidade: string[];
    bairro: string[];
  };
  const emptyFilters: FilterState = {
    search: "",
    dataInicial: "",
    dataFinal: "",
    categoria: [],
    prioridade: [],
    status: [],
    ordenar: [],
    tipoContato: [],
    cidade: [],
    bairro: [],
  };
  const [draft, setDraft] = useState<FilterState>(emptyFilters);
  const [applied, setApplied] = useState<FilterState>(emptyFilters);
  const setDraftField = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  const tipoByContact = useMemo(() => {
    const m = new Map<string, string>();
    rawContatos.forEach((c: any) => {
      if (c.nome) m.set(String(c.nome).toLowerCase(), String(c.tipo || ""));
    });
    return m;
  }, [rawContatos]);

  const cidadeOptions = useMemo(() => {
    const set = new Set<string>();
    rawContatos.forEach((c: any) => {
      const cidade = (c.localizacao || "").split("/")[0]?.trim();
      if (cidade) set.add(cidade);
    });
    demands.forEach((d) => { if (d.raw.cidade) set.add(d.raw.cidade); });
    return Array.from(set).sort().map((c) => ({ value: c, label: c }));
  }, [rawContatos, demands]);

  const filteredDemands = useMemo(() => {
    const f = applied;
    const s = f.search.trim().toLowerCase();
    const di = f.dataInicial ? parseISOLocal(f.dataInicial).getTime() : null;
    const df = f.dataFinal ? parseISOLocal(f.dataFinal).getTime() + 86_400_000 - 1 : null;

    const catLabelMap: Record<string, string> = {
      oficio: "Ofício", indicacao: "Indicação", requerimento: "Requerimento",
      emenda: "Emenda", projeto_lei: "Projeto de Lei", mensagem: "Mensagem",
      saude_exames: "Saúde/Exames",
    };
    const statusLabelMap: Record<string, string> = {
      pendente: "Pendente", em_andamento: "Em Andamento",
      aguardando: "Aguardando Retorno", concluida: "Concluída",
      cancelada: "Cancelada", nao_atendido: "Não atendido",
    };
    const prioLabelMap: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
    const tipoLabelMap: Record<string, string> = {
      parlamentar: "Parlamentar", autoridade: "Autoridade", cidadao: "Cidadão",
      entidade: "Entidade", empresa: "Empresa",
    };
    const catSet = new Set(f.categoria.map((v) => catLabelMap[v] || v));
    const prioSet = new Set(f.prioridade.map((v) => prioLabelMap[v] || v));
    const statusSet = new Set(f.status.map((v) => statusLabelMap[v] || v));
    const tipoSet = new Set(f.tipoContato.map((v) => tipoLabelMap[v] || v));
    const cidadeSet = new Set(f.cidade);

    let result = demands.filter((d) => {
      if (s) {
        const hay = `${d.request} ${d.raw.descricao || ""} ${d.contact} ${d.id}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      if (di || df) {
        const t = d.raw.dataSolicitacao ? parseISOLocal(d.raw.dataSolicitacao).getTime() : NaN;
        if (isNaN(t)) return false;
        if (di && t < di) return false;
        if (df && t > df) return false;
      }
      if (catSet.size && !catSet.has(d.raw.categoria)) return false;
      if (prioSet.size && !prioSet.has(d.raw.prioridade)) return false;
      if (statusSet.size && !statusSet.has(d.raw.status)) return false;
      if (tipoSet.size) {
        const tipo = tipoByContact.get(String(d.contact).toLowerCase()) || "";
        if (!tipoSet.has(tipo)) return false;
      }
      if (cidadeSet.size) {
        const cid = d.raw.cidade || cityByContact.get(String(d.contact).toLowerCase()) || "";
        if (!cidadeSet.has(cid)) return false;
      }
      return true;
    });

    const ord = f.ordenar[0];
    if (ord) {
      result = [...result].sort((a, b) => {
        if (ord === "vencimento") return (a.raw.vencimento || "").localeCompare(b.raw.vencimento || "");
        if (ord === "criacao") return (b.raw.dataSolicitacao || "").localeCompare(a.raw.dataSolicitacao || "");
        if (ord === "prioridade") {
          const order: Record<string, number> = { "Alta": 0, "Média": 1, "Baixa": 2 };
          return (order[a.raw.prioridade] ?? 9) - (order[b.raw.prioridade] ?? 9);
        }
        if (ord === "status") return (a.raw.status || "").localeCompare(b.raw.status || "");
        return 0;
      });
    }
    return result;
  }, [applied, demands, tipoByContact, cityByContact]);

  const exportFilters = useMemo(() => {
    const f = applied;
    const catLabelMap: Record<string, string> = {
      oficio: "Ofício", indicacao: "Indicação", requerimento: "Requerimento",
      emenda: "Emenda", projeto_lei: "Projeto de Lei", mensagem: "Mensagem",
      saude_exames: "Saúde/Exames",
    };
    const statusLabelMap: Record<string, string> = {
      pendente: "Pendente", em_andamento: "Em Andamento",
      aguardando: "Aguardando Retorno", concluida: "Concluída",
      cancelada: "Cancelada", nao_atendido: "Não atendido",
    };
    const prioLabelMap: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };
    const tipoLabelMap: Record<string, string> = {
      parlamentar: "Parlamentar", autoridade: "Autoridade", cidadao: "Cidadão",
      entidade: "Entidade", empresa: "Empresa",
    };
    const ordLabelMap: Record<string, string> = {
      vencimento: "Vencimento", criacao: "Data de criação",
      prioridade: "Prioridade", status: "Status",
    };
    const mapLabels = (arr: string[], m: Record<string, string>) =>
      arr.map((v) => m[v] || v).join(", ");

    const parts: string[] = [];
    const ord = f.ordenar[0];
    parts.push(`Ordenado por: ${ord ? (ordLabelMap[ord] || ord) : "Vencimento"}`);
    if (f.search.trim()) parts.push(`Busca: ${f.search.trim()}`);
    if (f.dataInicial) parts.push(`Data Inicial: ${formatBRDate(f.dataInicial)}`);
    if (f.dataFinal) parts.push(`Data Final: ${formatBRDate(f.dataFinal)}`);
    if (f.categoria.length) parts.push(`Categoria: ${mapLabels(f.categoria, catLabelMap)}`);
    if (f.prioridade.length) parts.push(`Prioridade: ${mapLabels(f.prioridade, prioLabelMap)}`);
    if (f.status.length) parts.push(`Status: ${mapLabels(f.status, statusLabelMap)}`);
    if (f.tipoContato.length) parts.push(`Tipo Contato: ${mapLabels(f.tipoContato, tipoLabelMap)}`);
    if (f.cidade.length) parts.push(`Cidade: ${f.cidade.join(", ")}`);
    if (f.bairro.length) parts.push(`Bairro: ${f.bairro.join(", ")}`);
    return parts;
  }, [applied]);

  const counts = useMemo(() => ({
    pending: filteredDemands.filter((d) => d.status === "pending").length,
    inProgress: filteredDemands.filter((d) => d.status === "in-progress").length,
    overdue: filteredDemands.filter((d) => d.status === "overdue").length,
    done: filteredDemands.filter((d) => d.status === "done").length,
  }), [filteredDemands]);

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
          value={draft.search}
          onChange={(v) => setDraftField("search", v)}
          options={filteredDemands.map((d) => ({
            value: String(d.id),
            label: d.request,
            sublabel: `#${d.id} • ${d.contact}`,
          }))}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <FilterField label="Data Inicial">
            <input
              type="date"
              value={draft.dataInicial}
              onChange={(e) => setDraftField("dataInicial", e.target.value)}
              className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </FilterField>
          <FilterField label="Data Final">
            <input
              type="date"
              value={draft.dataFinal}
              onChange={(e) => setDraftField("dataFinal", e.target.value)}
              className="w-full rounded-[10px] border-0 bg-white px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </FilterField>
          <FilterField label="Categoria">
            <MultiSelect
              placeholder="Todas"
              value={draft.categoria}
              onChange={(v) => setDraftField("categoria", v)}
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
              value={draft.prioridade}
              onChange={(v) => setDraftField("prioridade", v)}
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
              value={draft.status}
              onChange={(v) => setDraftField("status", v)}
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
              value={draft.ordenar}
              onChange={(v) => setDraftField("ordenar", v.slice(-1))}
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
              value={draft.tipoContato}
              onChange={(v) => setDraftField("tipoContato", v)}
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
            <MultiSelect
              placeholder="Todas"
              value={draft.cidade}
              onChange={(v) => setDraftField("cidade", v)}
              options={cidadeOptions}
            />
          </FilterField>
          <FilterField label="Bairro">
            <MultiSelect
              placeholder="Todos"
              value={draft.bairro}
              onChange={(v) => setDraftField("bairro", v)}
              options={[]}
            />
          </FilterField>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setApplied(draft)}
              aria-label="Aplicar filtros"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white transition-transform hover:brightness-110 active:scale-95"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { setDraft(emptyFilters); setApplied(emptyFilters); }}
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
        <SectionHeader
          title="Todas as Demandas"
          count={filteredDemands.length}
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const rows = filteredDemands.map((d) => ({
                    titulo: d.raw.titulo || "-",
                    categoria: d.raw.categoria || "-",
                    contato: d.raw.contato || "-",
                    cidade: d.raw.cidade || cityByContact.get(String(d.contact).toLowerCase()) || "-",
                    descricao: d.raw.descricao || "-",
                    dataSolicitacao: formatBRDate(d.raw.dataSolicitacao),
                    vencimento: formatBRDate(d.raw.vencimento),
                    observacoes: d.raw.observacoes || "-",
                  }));
                  void exportListToPdf({
                    title: "Lista de Demandas",
                    filters: [`Ordenado por: Data de solicitação`],
                    columns: DEMANDA_COLUMNS,
                    rows,
                    observationsKey: "observacoes",
                    filename: buildFilename("demandas", "pdf"),
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  const rows = filteredDemands.map((d) => ({
                    titulo: d.raw.titulo || "-",
                    categoria: d.raw.categoria || "-",
                    contato: d.raw.contato || "-",
                    cidade: d.raw.cidade || cityByContact.get(String(d.contact).toLowerCase()) || "-",
                    descricao: d.raw.descricao || "-",
                    dataSolicitacao: formatBRDate(d.raw.dataSolicitacao),
                    vencimento: formatBRDate(d.raw.vencimento),
                    observacoes: d.raw.observacoes || "-",
                  }));
                  void exportListToExcel({
                    title: "Lista de Demandas",
                    filters: [`Ordenado por: Data de solicitação`],
                    columns: DEMANDA_COLUMNS,
                    rows,
                    sheetName: "Demandas",
                    observationsKey: "observacoes",
                    filename: buildFilename("demandas", "xlsx"),
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel
              </button>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Demanda</th>
                <th className="px-5 py-3 text-left font-semibold">Categoria</th>
                <th className="px-5 py-3 text-left font-semibold">Contato</th>
                <th className="px-5 py-3 text-left font-semibold">Data Solicitação</th>
                <th className="px-5 py-3 text-left font-semibold">Vencimento</th>
                <th className="px-5 py-3 text-left font-semibold">Prioridade</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemands.map((d) => (
                <tr key={d.id} className="border-t border-border transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{d.request}</div>
                    {d.raw.descricao && (
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{d.raw.descricao}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-4 w-4 rounded-full bg-slate-200" />
                      {d.contact}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{formatBRDate(d.raw.dataSolicitacao)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{d.raw.vencimento ? formatBRDate(d.raw.vencimento) : "-"}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant={priorityVariant(d.priority)}>{d.priority}</StatusBadge>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant={d.status}>{d.statusLabel}</StatusBadge>
                  </td>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-slate-200 bg-slate-50 p-0 sm:rounded-2xl">
          {selectedDemand && (
            <>
              <DialogHeader className="border-b border-slate-200 bg-white px-5 py-3 rounded-t-2xl">
                <DialogTitle className="flex items-center gap-2 text-brand-blue">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-normal text-sm">Visualização do Relatório</span>
                </DialogTitle>
              </DialogHeader>

              <div className="px-5 py-4 space-y-3">
                <div className="text-center mb-3">
                  <h2 className="text-xl font-bold text-blue-500">ProDEM - Relatório de Demanda</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Contato</p>
                    <p className="mt-0.5 text-base font-bold text-slate-800">{selectedDemand.contact}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Cidade</p>
                    <p className="mt-0.5 text-base font-bold text-slate-800">{selectedDemand.raw.cidade || cityByContact.get(String(selectedDemand.contact).toLowerCase()) || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Título da Demanda</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">{selectedDemand.request}</p>
                  </div>
                  <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Categoria</p>
                    <p className="mt-0.5 text-sm text-slate-800">{selectedDemand.category}</p>
                  </div>
                  <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Datas</p>
                    <p className="mt-0.5 text-xs text-slate-800">Sol: {formatBRDate(selectedDemand.raw.dataSolicitacao)}<br/>Venc: {selectedDemand.raw.vencimento ? formatBRDate(selectedDemand.raw.vencimento) : "-"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase text-blue-400">Descrição</p>
                  <p className="mt-0.5 text-sm text-slate-800">{selectedDemand.raw.descricao || "-"}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase text-blue-400">Observação</p>
                  <p className="mt-0.5 text-sm text-slate-800">{selectedDemand.raw.observacoes || "-"}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                  <p className="text-[10px] font-semibold uppercase text-blue-400">Responsável pela Demanda</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-800">{(selectedDemand.raw as any).responsavel || "-"}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Data de Criação</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">{selectedDemand.date}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Prioridade</p>
                    <p className={`mt-0.5 text-sm font-bold ${selectedDemand.priority === 'Alta' ? 'text-red-500' : selectedDemand.priority === 'Média' ? 'text-orange-500' : 'text-green-500'}`}>
                      {selectedDemand.priority}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-semibold uppercase text-blue-400">Status</p>
                    <p className={`mt-0.5 text-sm font-bold ${selectedDemand.status === 'done' ? 'text-green-500' : 'text-slate-800'}`}>
                      {selectedDemand.statusLabel}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200 bg-slate-50/50 px-5 py-3 rounded-b-2xl flex justify-end gap-2">
                <Button variant="outline" className="rounded-full bg-white text-slate-700 font-normal px-5" onClick={() => setSelectedDemand(null)}>Fechar</Button>
                <Button className="rounded-full bg-[#3b82f6] hover:bg-blue-600 text-white font-normal px-5">
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
