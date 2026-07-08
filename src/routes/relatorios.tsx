import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — PRODEM" },
      { name: "description", content: "Relatórios e análises das demandas do gabinete." },
    ],
  }),
  component: Relatorios,
});

const donutData = [
  { name: "Pendentes", value: 5, color: "#F59E0B", pct: 2 },
  { name: "Em Progresso", value: 59, color: "#3B82F6", pct: 19 },
  { name: "Concluídas", value: 171, color: "#22C55E", pct: 55 },
  { name: "Atrasadas", value: 78, color: "#EF4444", pct: 25 },
];

const categoryBars = [
  { name: "Ofício", value: 214, color: "bg-cat-4" },
  { name: "Mensagem", value: 102, color: "bg-cat-3" },
  { name: "Atendimento", value: 24, color: "bg-cat-6" },
  { name: "Outra", value: 11, color: "bg-slate-400" },
  { name: "Evento", value: 2, color: "bg-cat-2" },
  { name: "Saúde/Exames", value: 1, color: "bg-cat-7" },
];

const total = donutData.reduce((a, b) => a + b.value, 0);
const maxCat = Math.max(...categoryBars.map((c) => c.value));

function Relatorios() {
  return (
    <AppLayout>
      <PageHeader
        icon={BarChart3}
        title="Relatórios"
        subtitle="Análise consolidada das demandas e desempenho do gabinete"
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]">
            <Download className="h-4 w-4" />
            Exportar PDF
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Donut */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <SectionHeader title="Distribuição por Status" />
          <div className="grid grid-cols-1 items-center gap-4 p-6 sm:grid-cols-[240px_1fr]">
            <div className="relative h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-extrabold text-foreground">{total}</div>
                <div className="text-xs font-medium text-muted-foreground">demandas</div>
              </div>
            </div>
            <ul className="space-y-3">
              {donutData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-sm font-medium text-foreground">{d.name}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-foreground">{d.value}</span>
                    <span className="text-xs text-muted-foreground">({d.pct}%)</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Category bars */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <SectionHeader title="Demandas por Categoria" />
          <ul className="space-y-4 p-6">
            {categoryBars.map((c) => (
              <li key={c.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-sm font-bold text-foreground">{c.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${c.color} transition-all`}
                    style={{ width: `${(c.value / maxCat) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
