import { createFileRoute } from "@tanstack/react-router";
import { Activity, Plus, GripVertical, Pencil } from "@/components/icons";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — PRODEM" },
      { name: "description", content: "Fluxo de status das demandas do gabinete." },
    ],
  }),
  component: Status,
});

const statuses = [
  { n: 1, name: "Pendente", desc: "Aguardando triagem inicial", dot: "bg-brand-orange" },
  { n: 2, name: "Em Andamento", desc: "Em execução pela equipe", dot: "bg-brand-blue" },
  { n: 3, name: "Aguardando Retorno", desc: "Aguardando resposta externa", dot: "bg-waiting" },
  { n: 4, name: "Concluída", desc: "Demanda resolvida com sucesso", dot: "bg-teal-600" },
  { n: 5, name: "Cancelada", desc: "Encerrada sem execução", dot: "bg-danger" },
  { n: 6, name: "Não atendido", desc: "Contato inacessível ou fora do escopo", dot: "bg-slate-700" },
];

function Status() {
  return (
    <AppLayout>
      <PageHeader
        icon={Activity}
        title="Status"
        subtitle="Configure o fluxo de acompanhamento das demandas"
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Novo Status
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SectionHeader
          title="Fluxo de Status"
          count={statuses.length}
          action={
            <span className="text-xs font-medium text-white/60">
              Arraste para reordenar
            </span>
          }
        />
        <ul className="divide-y divide-border">
          {statuses.map((s) => (
            <li
              key={s.n}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
            >
              <button
                aria-label="Arrastar para reordenar"
                className="cursor-grab text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                {s.n}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                  <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <button
                aria-label="Editar status"
                className="rounded-md p-2 text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-strong"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AppLayout>
  );
}
