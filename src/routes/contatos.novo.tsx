import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/contatos/novo")({
  head: () => ({
    meta: [
      { title: "Novo Contato — PRODEM" },
      { name: "description", content: "Cadastro de novo contato no PRODEM." },
    ],
  }),
  component: NovoContato,
});

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-slate-50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20";

function NovoContato() {
  return (
    <AppLayout>
      <PageHeader
        icon={UserPlus}
        title="Novo Contato"
        subtitle="Preencha os dados do cidadão para adicioná-lo ao cadastro"
        action={
          <Link
            to="/contatos"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      <form className="space-y-6">
        {/* Dados Pessoais */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <header className="mb-5 border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">Dados Pessoais</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Informações de identificação do contato
            </p>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome completo" required>
              <input className={inputCls} placeholder="Ex: João da Silva" />
            </Field>
            <Field label="CPF">
              <input className={inputCls} placeholder="000.000.000-00" />
            </Field>
            <Field label="Data de nascimento">
              <input type="date" className={inputCls} />
            </Field>
            <Field label="Gênero">
              <select className={inputCls}>
                <option>Selecione…</option>
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Contato */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <header className="mb-5 border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">Contato</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Formas de contato para retorno
            </p>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Telefone" required>
              <input className={inputCls} placeholder="(00) 00000-0000" />
            </Field>
            <Field label="E-mail">
              <input type="email" className={inputCls} placeholder="email@exemplo.com" />
            </Field>
          </div>
        </section>

        {/* Endereço */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <header className="mb-5 border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">Endereço</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Localização do contato</p>
          </header>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <Field label="CEP">
                <input className={inputCls} placeholder="00000-000" />
              </Field>
            </div>
            <div className="md:col-span-4">
              <Field label="Logradouro">
                <input className={inputCls} placeholder="Rua, avenida…" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Número">
                <input className={inputCls} placeholder="123" />
              </Field>
            </div>
            <div className="md:col-span-4">
              <Field label="Bairro">
                <input className={inputCls} placeholder="Bairro" />
              </Field>
            </div>
            <div className="md:col-span-4">
              <Field label="Cidade">
                <input className={inputCls} placeholder="Cidade" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="UF">
                <select className={inputCls}>
                  <option>SP</option>
                  <option>RJ</option>
                  <option>MG</option>
                </select>
              </Field>
            </div>
          </div>
        </section>

        {/* Observações */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <header className="mb-5 border-b border-border pb-3">
            <h2 className="text-base font-bold text-foreground">Observações</h2>
          </header>
          <textarea
            rows={4}
            className={inputCls}
            placeholder="Notas internas sobre o contato…"
          />
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/contatos"
            className="rounded-lg border border-input bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]"
          >
            Salvar contato
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
