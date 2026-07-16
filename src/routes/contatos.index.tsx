import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Plus, Search, Eye, Pencil, Phone, Mail, Hash, Building2, UserCheck, FileDown, FileSpreadsheet } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { KPICard } from "@/components/ui/KPICard";
import { ContactAutocomplete } from "@/components/ui/ContactAutocomplete";

export const Route = createFileRoute("/contatos/")({
  head: () => ({
    meta: [
      { title: "Contatos — PRODEM" },
      { name: "description", content: "Cadastro e gestão de contatos do gabinete." },
    ],
  }),
  component: Contatos,
});

const contacts = [
  {
    id: 1,
    name: "José Almeida",
    email: "jose.almeida@email.com",
    phone: "(11) 98765-4321",
    city: "São Paulo/SP",
    demands: 4,
    color: "bg-cat-1",
  },
  {
    id: 2,
    name: "Ana Ribeiro",
    email: "ana.ribeiro@email.com",
    phone: "(11) 97654-3210",
    city: "Guarulhos/SP",
    demands: 2,
    color: "bg-cat-2",
  },
  {
    id: 3,
    name: "Carlos Souza",
    email: "carlos.souza@email.com",
    phone: "(11) 96543-2109",
    city: "Osasco/SP",
    demands: 7,
    color: "bg-cat-3",
  },
  {
    id: 4,
    name: "Fernanda Lima",
    email: "fernanda.lima@email.com",
    phone: "(11) 95432-1098",
    city: "Santo André/SP",
    demands: 1,
    color: "bg-cat-4",
  },
  {
    id: 5,
    name: "Roberto Nunes",
    email: "roberto.nunes@email.com",
    phone: "(11) 94321-0987",
    city: "São Bernardo/SP",
    demands: 3,
    color: "bg-cat-5",
  },
  {
    id: 6,
    name: "Patrícia Gomes",
    email: "patricia.gomes@email.com",
    phone: "(11) 93210-9876",
    city: "Diadema/SP",
    demands: 5,
    color: "bg-cat-6",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const contactExtras: Record<number, { code: string; tipo: string; tipoTone: string }> = {
  1: { code: "213670", tipo: "Cidadão", tipoTone: "bg-brand-blue-soft text-brand-blue-strong" },
  2: { code: "667907", tipo: "Mídia", tipoTone: "bg-brand-orange-soft text-brand-orange" },
  3: { code: "577830", tipo: "Liderança", tipoTone: "bg-[#F5F3FF] text-waiting" },
  4: { code: "495391", tipo: "Cidadão", tipoTone: "bg-brand-blue-soft text-brand-blue-strong" },
  5: { code: "384762", tipo: "Parlamentar", tipoTone: "bg-success-soft text-success" },
  6: { code: "295184", tipo: "Empresa", tipoTone: "bg-danger-soft text-danger" },
};

function Contatos() {
  return (
    <AppLayout>
      <PageHeader
        icon={Users}
        title="Contatos"
        subtitle="Cadastro e gestão de cidadãos atendidos pelo gabinete"
        action={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-slate-50"
            >
              <Hash className="h-4 w-4" />
              Gerar Códigos
            </button>
            <Link
              to="/contatos/novo"
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Novo Contato
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard icon={Users} value={contacts.length} label="Total" tone="blue" compact />
        <KPICard icon={UserCheck} value={4} label="Cidadãos" tone="navy" compact />
        <KPICard icon={Building2} value={0} label="Entidades" tone="green" compact />
        <KPICard icon={Building2} value={1} label="Empresas" tone="orange" compact />
      </div>

      {/* Filter bar */}
      <div className="mb-3 rounded-2xl bg-navy-800 p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px_auto]">
          <ContactAutocomplete
            placeholder="Buscar por código, nome, email ou telefone…"
            options={contacts.map((c) => ({
              value: String(c.id),
              label: c.name,
              sublabel: `${c.email} • ${c.phone}`,
            }))}
          />
          <select id="contatos-cidade" name="cidade" className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option>Todas as cidades</option>
            <option>São Paulo/SP</option>
            <option>Guarulhos/SP</option>
          </select>
          <select id="contatos-categoria" name="categoria" className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue">
            <option>Todas as categorias</option>
            <option>Emenda</option>
            <option>Ofício</option>
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
        <SectionHeader
          title="Lista de Contatos"
          count={contacts.length}
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
              >
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </button>
              <button
                type="button"
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
                <th className="px-5 py-3 text-left font-semibold">Código</th>
                <th className="px-5 py-3 text-left font-semibold">Contato</th>
                <th className="px-5 py-3 text-left font-semibold">Tipo</th>
                <th className="px-5 py-3 text-left font-semibold">Telefone</th>
                <th className="px-5 py-3 text-left font-semibold">Localização</th>
                <th className="px-5 py-3 text-left font-semibold">Demandas</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const extra = contactExtras[c.id];
                return (
                <tr
                  key={c.id}
                  className="border-t border-border transition-colors hover:bg-slate-50"
                >
                  <td className="px-5 py-3.5 font-semibold text-brand-blue-strong">{extra?.code}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${c.color}`}
                      >
                        {initials(c.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {c.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${extra?.tipoTone}`}>
                      {extra?.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {c.phone}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.city}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center justify-center rounded-full bg-brand-blue-soft px-2.5 py-0.5 text-xs font-semibold text-brand-blue-strong">
                      {c.demands}
                    </span>
                  </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
