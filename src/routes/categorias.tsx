import { createFileRoute } from "@tanstack/react-router";
import {
  Tags,
  Plus,
  Pencil,
  FileText,
  MessageSquare,
  Send,
  Vote,
  ScrollText,
  Stethoscope,
  Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";

export const Route = createFileRoute("/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias — PRODEM" },
      { name: "description", content: "Gestão das categorias de demandas do gabinete." },
    ],
  }),
  component: Categorias,
});

interface Cat {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  dot: string;
  total: number;
}

const categorias: Cat[] = [
  { id: 1, name: "Emenda", description: "Emendas parlamentares ao orçamento", icon: FileText, color: "bg-red-50 text-red-600", dot: "bg-cat-1", total: 43 },
  { id: 2, name: "Indicação", description: "Indicações formais ao Executivo", icon: Send, color: "bg-orange-50 text-orange-600", dot: "bg-cat-2", total: 87 },
  { id: 3, name: "Mensagem", description: "Mensagens institucionais e apoio", icon: MessageSquare, color: "bg-green-50 text-green-600", dot: "bg-cat-3", total: 102 },
  { id: 4, name: "Ofício", description: "Ofícios enviados a órgãos públicos", icon: ScrollText, color: "bg-blue-50 text-blue-600", dot: "bg-cat-4", total: 214 },
  { id: 5, name: "Projeto de Lei", description: "Propostas legislativas em tramitação", icon: Vote, color: "bg-sky-50 text-sky-600", dot: "bg-cat-5", total: 18 },
  { id: 6, name: "Requerimento", description: "Requerimentos administrativos", icon: Megaphone, color: "bg-violet-50 text-violet-600", dot: "bg-cat-6", total: 61 },
  { id: 7, name: "Saúde/Exames", description: "Solicitações de saúde e exames", icon: Stethoscope, color: "bg-lime-50 text-lime-600", dot: "bg-cat-7", total: 34 },
];

function Categorias() {
  return (
    <AppLayout>
      <PageHeader
        icon={Tags}
        title="Categorias"
        subtitle="Organize os tipos de demandas registradas no sistema"
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Nova Categoria
          </button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SectionHeader title="Categorias Cadastradas" count={categorias.length} />
        <ul className="divide-y divide-border">
          {categorias.map((c) => {
            const Icon = c.icon;
            return (
              <li
                key={c.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                    <h3 className="text-sm font-bold text-foreground">{c.name}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{c.total}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    demandas
                  </div>
                </div>
                <button
                  aria-label="Editar categoria"
                  className="rounded-md p-2 text-muted-foreground hover:bg-brand-blue-soft hover:text-brand-blue-strong"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </AppLayout>
  );
}
