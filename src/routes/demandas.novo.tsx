import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, X, Save, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/demandas/novo")({
  head: () => ({
    meta: [
      { title: "Nova Demanda — PRODEM" },
      { name: "description", content: "Cadastro de nova demanda no PRODEM." },
    ],
  }),
  component: NovaDemanda,
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

function NovaDemanda() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [lembrete, setLembrete] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    toast.success("Demanda salva com sucesso!");
    navigate({ to: "/demandas" });
  };

  return (
    <AppLayout>
      <PageHeader
        icon={ClipboardList}
        title="Nova Demanda"
        subtitle="Cadastre uma nova atividade"
      />

      <form
        onSubmit={handleFormSubmit}
        className="rounded-[24px] border border-border bg-white p-8 shadow-sm"
      >
        <div className="space-y-5">
          <Field label="Título da Demanda" required>
            <input className={inputCls} placeholder="Digite o título da demanda" />
          </Field>

          <Field label="Descrição" required>
            <textarea
              rows={4}
              className={textareaCls}
              placeholder="Descreva os detalhes da demanda..."
            />
          </Field>

          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            <Field label="Categoria" required>
              <CategorySelect value={categoria} onValueChange={setCategoria} />
            </Field>
            <Field label="Prioridade" required>
              <SimpleSelect
                value={prioridade}
                onValueChange={setPrioridade}
                placeholder="Selecione a prioridade"
                options={[
                  { value: "Alta", label: "Alta" },
                  { value: "Média", label: "Média" },
                  { value: "Baixa", label: "Baixa" },
                ]}
              />
            </Field>

            <Field label="Dias Estimados">
              <input type="number" min={0} className={inputCls} placeholder="Ex: 5" />
            </Field>
            <Field label="Lembrete">
              <SimpleSelect
                value={lembrete}
                onValueChange={setLembrete}
                placeholder="Selecione o lembrete"
                options={[
                  { value: "Sem lembrete", label: "Sem lembrete" },
                  { value: "1 dia antes", label: "1 dia antes" },
                  { value: "3 dias antes", label: "3 dias antes" },
                  { value: "1 semana antes", label: "1 semana antes" },
                ]}
              />
            </Field>

            <Field label="Status" required>
              <StatusSelect value={status} onValueChange={setStatus} />
            </Field>
            <Field label="Data Solicitação" required>
              <input type="date" className={inputCls} defaultValue="2026-07-13" />
            </Field>

            <Field label="Contato Vinculado">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="Digite para buscar contato..."
                />
              </div>
            </Field>
            <Field label="Responsável">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputCls} pl-9`}
                  placeholder="Digite para buscar responsável..."
                />
              </div>
            </Field>
          </div>

          <Field label="Observações">
            <textarea
              rows={3}
              className={textareaCls}
              placeholder="Observações adicionais..."
            />
          </Field>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-800">Anexos</span>
            <FileUpload />
          </div>
        </div>

        <div className="mt-10 flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
          <Link
            to="/demandas"
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
            Salvar Demanda
          </button>
        </div>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar demanda?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente salvar esta demanda? Verifique os dados informados antes de confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
