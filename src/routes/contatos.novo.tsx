import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { UserPlus, X, Save, Upload, FileText, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
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
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-800">
        {label} {required && "*"}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-[16px] border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-foreground placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all";

const textareaCls =
  "w-full rounded-[16px] border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-foreground placeholder:text-slate-400 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all";

function NovoContato() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Contato salvo com sucesso!");
    navigate({ to: "/contatos" });
  };

  return (
    <AppLayout>
      <PageHeader
        icon={UserPlus}
        title="Novo Contato"
        subtitle="Cadastre um novo contato"
      />

      <form onSubmit={handleSubmit} className="rounded-[24px] border border-border bg-white p-8 shadow-sm">
        <div className="space-y-10">
          {/* Dados Pessoais */}
          <section>
            <h2 className="text-[15px] font-medium text-slate-800">Dados Pessoais</h2>
            <hr className="mb-6 mt-3 border-slate-100" />
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Nome Completo" required>
                  <input className={inputCls} placeholder="Digite o nome completo" />
                </Field>
              </div>
              <Field label="Tipo de Contato" required>
                <select className={inputCls}>
                  <option>Cidadão</option>
                  <option>Empresa</option>
                  <option>Servidor</option>
                </select>
              </Field>
              <Field label="CPF/CNPJ">
                <input className={inputCls} placeholder="000.000.000-00" />
              </Field>
            </div>
          </section>

          {/* Informações de Contato */}
          <section>
            <h2 className="text-[15px] font-medium text-slate-800">Informações de Contato</h2>
            <hr className="mb-6 mt-3 border-slate-100" />
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field label="Telefone">
                <input className={inputCls} placeholder="(00) 00000-0000" />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} placeholder="email@exemplo.com" />
              </Field>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <h2 className="text-[15px] font-medium text-slate-800">Endereço</h2>
            <hr className="mb-6 mt-3 border-slate-100" />
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-12">
              <div className="md:col-span-3">
                <Field label="CEP">
                  <input className={inputCls} placeholder="00000-000" />
                </Field>
                <p className="mt-2 text-xs text-slate-500">
                  Digite o CEP para preencher o endereço automaticamente
                </p>
              </div>
              <div className="md:col-span-7">
                <Field label="Endereço">
                  <input className={inputCls} placeholder="Rua, Avenida..." />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Número">
                  <input className={inputCls} placeholder="Nº" />
                </Field>
              </div>
              
              <div className="md:col-span-4">
                <Field label="Complemento">
                  <input className={inputCls} placeholder="Apto, Bloco, Sala..." />
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

              <div className="md:col-span-4">
                <Field label="Estado">
                  <select className={inputCls}>
                    <option>-</option>
                    <option>AC</option>
                    <option>AL</option>
                    <option>AP</option>
                    <option>AM</option>
                    <option>BA</option>
                    <option>CE</option>
                    <option>DF</option>
                    <option>ES</option>
                    <option>GO</option>
                    <option>MA</option>
                    <option>MT</option>
                    <option>MS</option>
                    <option>MG</option>
                    <option>PA</option>
                    <option>PB</option>
                    <option>PR</option>
                    <option>PE</option>
                    <option>PI</option>
                    <option>RJ</option>
                    <option>RN</option>
                    <option>RS</option>
                    <option>RO</option>
                    <option>RR</option>
                    <option>SC</option>
                    <option>SP</option>
                    <option>SE</option>
                    <option>TO</option>
                  </select>
                </Field>
              </div>
            </div>
          </section>

          {/* Informações Adicionais */}
          <section>
            <h2 className="text-[15px] font-medium text-slate-800">Informações Adicionais</h2>
            <hr className="mb-6 mt-3 border-slate-100" />
            <Field label="Observações">
              <textarea
                rows={4}
                className={textareaCls}
                placeholder="Observações adicionais sobre o contato..."
              />
            </Field>
          </section>
        </div>

        {/* Footer Buttons */}
        <div className="mt-10 flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
          <Link
            to="/contatos"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Salvar Contato
          </button>
        </div>
      </form>
    </AppLayout>
  );
}

