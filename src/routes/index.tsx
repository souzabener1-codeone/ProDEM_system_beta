import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  Plus,
  Eye,
  Pencil,
} from "@/components/icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { KPICard } from "@/components/ui/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";

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

const recentDemands = [
  {
    id: 1,
    contact: "José Almeida",
    request: "Apoio financeiro para tratamento",
    category: "Ofício",
    priority: "Média" as const,
    status: "in-progress" as const,
    statusLabel: "Em Andamento",
    date: "07/07/2026",
  },
  {
    id: 2,
    contact: "Ana Ribeiro",
    request: "Kit enxoval maternidade",
    category: "Indicação",
    priority: "Alta" as const,
    status: "pending" as const,
    statusLabel: "Pendente",
    date: "06/07/2026",
  },
  {
    id: 3,
    contact: "Carlos Souza",
    request: "Iluminação pública Rua das Palmeiras",
    category: "Requerimento",
    priority: "Média" as const,
    status: "waiting" as const,
    statusLabel: "Aguardando Retorno",
    date: "05/07/2026",
  },
  {
    id: 4,
    contact: "Fernanda Lima",
    request: "Agendamento exame cardiológico",
    category: "Saúde/Exames",
    priority: "Alta" as const,
    status: "done" as const,
    statusLabel: "Concluída",
    date: "04/07/2026",
  },
  {
    id: 5,
    contact: "Roberto Nunes",
    request: "Emenda para reforma da escola",
    category: "Emenda",
    priority: "Média" as const,
    status: "in-progress" as const,
    statusLabel: "Em Andamento",
    date: "03/07/2026",
  },
];

function priorityVariant(p: "Alta" | "Média" | "Baixa") {
  return p === "Alta" ? "priority-high" : p === "Média" ? "priority-medium" : "priority-low";
}

function Dashboard() {
  return (
    <AppLayout>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Visão geral das atividades e indicadores do gabinete"
      />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard icon={ClipboardList} value={354} label="Total de Demandas" tone="navy" />
        <KPICard icon={Clock} value={12} label="Vencendo em 7 dias" tone="orange" />
        <KPICard icon={Loader2} value={59} label="Em Progresso" tone="blue" />
        <KPICard icon={AlertTriangle} value={78} label="Atrasadas" tone="red" />
        <KPICard icon={CheckCircle2} value={171} label="Concluídas" tone="green" />
        <KPICard icon={Users} value={266} label="Total de Contatos" tone="purple" />
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
              {recentDemands.map((d) => (
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
                      <button
                        aria-label="Visualizar"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-brand-blue-soft hover:text-brand-blue-strong"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        aria-label="Editar"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-brand-blue-soft hover:text-brand-blue-strong"
                      >
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
