import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContatos, type Contato } from "@/lib/contatos.functions";
import { Users, Plus, Search, Eye, Pencil, Phone, Mail, Hash, Building2, UserCheck, FileDown, FileSpreadsheet, MoreHorizontal, Trash2, FileText, Download } from "@/components/icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

const CAT_COLORS = ["bg-cat-1", "bg-cat-2", "bg-cat-3", "bg-cat-4", "bg-cat-5", "bg-cat-6"];

const TIPO_TONES: Record<string, string> = {
  Cidadão: "bg-brand-blue-soft text-brand-blue-strong",
  Liderança: "bg-[#F5F3FF] text-waiting",
  Parlamentar: "bg-success-soft text-success",
  Autoridade: "bg-success-soft text-success",
  Empresa: "bg-danger-soft text-danger",
  Empresário: "bg-danger-soft text-danger",
  Mídia: "bg-brand-orange-soft text-brand-orange",
  Jornalista: "bg-brand-orange-soft text-brand-orange",
  Assessor: "bg-slate-100 text-slate-700",
  Funcionário: "bg-slate-100 text-slate-700",
};

type UIContact = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  tipo: string;
  tipoTone: string;
  demands: number;
  color: string;
};

function safeParse<T>(raw: string, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function mapContato(c: Contato, idx: number): UIContact {
  const contatoData = safeParse<{ email?: string; telefone?: string }>(c.contato, {});
  const loc = safeParse<{ cidade?: string; estado?: string }>(c.localizacao, {});
  const city = [loc.cidade, loc.estado].filter(Boolean).join("/");
  return {
    id: c.id,
    code: c.codigo,
    name: c.nome,
    email: contatoData.email ?? "",
    phone: contatoData.telefone ?? "",
    city,
    tipo: c.tipo,
    tipoTone: TIPO_TONES[c.tipo] ?? "bg-slate-100 text-slate-700",
    demands: 0,
    color: CAT_COLORS[idx % CAT_COLORS.length],
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}


function Contatos() {
  const listFn = useServerFn(listContatos);
  const { data: raw = [] } = useQuery({
    queryKey: ["contatos"],
    queryFn: () => listFn(),
  });
  const contacts = useMemo(() => raw.map(mapContato), [raw]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<UIContact | null>(null);
  const [cidade, setCidade] = useState("Todas as cidades");
  const [categoria, setCategoria] = useState("Todos");

  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: "",
    cidade: "Todas as cidades",
    categoria: "Todos",
  });

  const handleSearch = () => {
    setAppliedFilters({ searchQuery, cidade, categoria });
  };

  const filteredContacts = contacts.filter((c) => {
    const query = appliedFilters.searchQuery.toLowerCase();
    const matchQuery = !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      (c.code && c.code.toLowerCase().includes(query));
    const matchCidade = appliedFilters.cidade === "Todas as cidades" || c.city === appliedFilters.cidade;
    const matchCategoria = appliedFilters.categoria === "Todos" || c.tipo === appliedFilters.categoria;
    return matchQuery && matchCidade && matchCategoria;
  });

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
        <KPICard icon={UserCheck} value={contacts.filter((c) => c.tipo === "Cidadão").length} label="Cidadãos" tone="navy" compact />
        <KPICard icon={Building2} value={contacts.filter((c) => c.tipo === "Entidade").length} label="Entidades" tone="green" compact />
        <KPICard icon={Building2} value={contacts.filter((c) => c.tipo === "Empresa").length} label="Empresas" tone="orange" compact />
      </div>

      {/* Filter bar */}
      <div className="mb-3 rounded-2xl bg-navy-800 p-4 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px_auto]">
          <ContactAutocomplete
            placeholder="Buscar por código, nome, email ou telefone…"
            value={searchQuery}
            onChange={setSearchQuery}
            options={contacts.map((c) => ({
              value: String(c.id),
              label: c.name,
              sublabel: `${c.email} • ${c.phone}`,
            }))}
          />
          <select 
            id="contatos-cidade" 
            name="cidade" 
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option>Todas as cidades</option>
            <option>São Paulo/SP</option>
            <option>Guarulhos/SP</option>
          </select>
          <select 
            id="contatos-categoria" 
            name="categoria" 
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option>Todos</option>
            <option>Parlamentar</option>
            <option>Autoridade</option>
            <option>Assessor</option>
            <option>Funcionário</option>
            <option>Jornalista</option>
            <option>Mídia</option>
            <option>Empresário</option>
            <option>Empresa</option>
            <option>Cidadão</option>
            <option>Liderança</option>
          </select>
          <button
            type="button"
            aria-label="Buscar"
            onClick={handleSearch}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white transition-transform hover:brightness-110 active:scale-95"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SectionHeader
          title="Lista de Contatos"
          count={filteredContacts.length}
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
              {filteredContacts.map((c) => {
                return (
                <tr
                  key={c.id}
                  className="border-t border-border transition-colors hover:bg-slate-50"
                >
                  <td className="px-5 py-3.5 font-semibold text-brand-blue-strong">{c.code}</td>
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
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.tipoTone}`}>
                      {c.tipo}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            aria-label="Ações"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-brand-blue-soft hover:text-brand-blue-strong outline-none"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem asChild>
                            <button onClick={() => setSelectedContact(c)} className="flex w-full items-center gap-2 cursor-pointer">
                              <Eye className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-700">Visualizar</span>
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/contatos/${c.id}/editar`} className="flex w-full items-center gap-2 cursor-pointer">
                              <Pencil className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-700">Editar</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <button className="flex w-full items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                              <span>Excluir</span>
                            </button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="max-w-3xl border-slate-200 bg-slate-50 p-0 sm:rounded-2xl">
          {selectedContact && (
            <>
              <DialogHeader className="border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
                <DialogTitle className="flex items-center gap-2 text-brand-blue">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400 font-normal">Visualização do Relatório</span>
                </DialogTitle>
              </DialogHeader>

              <div className="px-6 py-6 space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-500">ProDEM - Relatório de Contato</h2>
                  <p className="text-sm text-slate-500 mt-1">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Contato</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">{selectedContact.name}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Cidade</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">{selectedContact.city}</p>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Email</p>
                    <p className="mt-1 text-base font-bold text-slate-800">{selectedContact.email}</p>
                  </div>
                  <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Telefone</p>
                    <p className="mt-1 text-base text-slate-800">{selectedContact.phone}</p>
                  </div>
                  <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Tipo</p>
                    <p className="mt-1 text-sm text-slate-800">{selectedContact.tipo || "-"}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-400">Observação</p>
                  <p className="mt-1 text-base text-slate-800">Nenhuma observação registrada para este contato.</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-blue-400">Código do Contato</p>
                  <p className="mt-1 text-base font-bold text-slate-800">{selectedContact.code || "---"}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Demandas Vinculadas</p>
                    <p className="mt-1 text-base font-bold text-slate-800">{selectedContact.demands}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Status</p>
                    <p className="mt-1 font-bold text-green-500">Ativo</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <p className="text-xs font-semibold uppercase text-blue-400">Data de Cadastro</p>
                    <p className="mt-1 font-bold text-slate-800">01/01/2026</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200 bg-slate-50/50 px-6 py-4 rounded-b-2xl flex justify-end gap-2">
                <Button variant="outline" className="rounded-full bg-white text-slate-700 font-normal px-6" onClick={() => setSelectedContact(null)}>Fechar</Button>
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
