import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  Eye,
  Pencil,
} from "@/components/icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listDemandas, type Demanda } from "@/lib/demandas.functions";
import { listContatos } from "@/lib/contatos.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — PRODEM" },
      {
        name: "description",
        content: "Visão geral de contatos, demandas e indicadores do gabinete.",
      },
    ],
  }),
  component: Dashboard,
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
  createdAt: number;
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
  const createdRef = d.dataSolicitacao || d.vencimento;
  const createdAt = createdRef ? new Date(createdRef).getTime() : 0;
  return {
    id: `${index}`,
    contact: d.contato || "-",
    request: d.titulo,
    category: d.categoria || "-",
    priority,
    status: isOverdue ? "overdue" : s.variant,
    statusLabel: isOverdue ? "Atrasada" : s.label,
    date: formatDate(d.dataSolicitacao || d.vencimento),
    createdAt: isNaN(createdAt) ? 0 : createdAt,
  };
}

function priorityVariant(p: "Alta" | "Média" | "Baixa") {
  return p === "Alta" ? "priority-high" : p === "Média" ? "priority-medium" : "priority-low";
}

function isDueWithinDays(d: Demanda, days: number): boolean {
  if (!d.vencimento) return false;
  const due = new Date(d.vencimento);
  if (isNaN(due.getTime())) return false;
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
}

function Dashboard() {
  const listDemFn = useServerFn(listDemandas);
  const listContFn = useServerFn(listContatos);
  const { data: rawDemandas = [] } = useQuery({ queryKey: ["demandas"], queryFn: () => listDemFn() });
  const { data: rawContatos = [] } = useQuery({ queryKey: ["contatos"], queryFn: () => listContFn() });

  const demands = useMemo(
    () => rawDemandas.map((d, i) => mapDemand(d, i)),
    [rawDemandas],
  );

  const counts = useMemo(() => ({
    total: demands.length,
    dueSoon: rawDemandas.filter((d) => isDueWithinDays(d, 7)).length,
    inProgress: demands.filter((d) => d.status === "in-progress").length,
    overdue: demands.filter((d) => d.status === "overdue").length,
    done: demands.filter((d) => d.status === "done").length,
    contatos: rawContatos.length,
  }), [demands, rawDemandas, rawContatos]);

  const recentDemands = useMemo(
    () => [...demands].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [demands],
  );

  return (
    <AppLayout>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Visão geral das atividades e indicadores do gabinete"
      />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard icon={ClipboardList} value={counts.total} label="Total de Demandas" tone="navy" />
        <KPICard icon={Clock} value={counts.dueSoon} label="Vencendo em 7 dias" tone="orange" />
        <KPICard icon={Loader2} value={counts.inProgress} label="Em Progresso" tone="blue" />
        <KPICard icon={AlertTriangle} value={counts.overdue} label="Atrasadas" tone="red" />
        <KPICard icon={CheckCircle2} value={counts.done} label="Concluídas" tone="green" />
        <KPICard icon={Users} value={counts.contatos} label="Total de Contatos" tone="purple" />
      </div>

      {/* Recent demands */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SectionHeader
          title="Demandas Recentes"
          count={recentDemands.length}
          action={
            <Link
              to="/demandas"
              className="text-xs font-medium text-white/70 hover:text-white"
            >
              Ver todas →
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
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
              {recentDemands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma demanda cadastrada ainda.
                  </td>
                </tr>
              ) : (
                recentDemands.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-border transition-colors hover:bg-slate-50"
                  >
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
                        <Link
                          to={`/demandas/${d.id}/editar`}
                          aria-label="Visualizar"
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-brand-blue-soft hover:text-brand-blue-strong"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/demandas/${d.id}/editar`}
                          aria-label="Editar"
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-brand-blue-soft hover:text-brand-blue-strong"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
