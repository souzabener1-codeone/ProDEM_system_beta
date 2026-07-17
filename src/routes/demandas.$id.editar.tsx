import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { X, Save, Search, Edit, Clock } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { MovimentacaoStepper } from "@/components/demandas/MovimentacaoStepper";
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

export const Route = createFileRoute("/demandas/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar Demanda — PRODEM" },
      { name: "description", content: "Edição de demanda no PRODEM." },
    ],
  }),
  component: EditarDemanda,
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

function EditarDemanda() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("concluida");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [lembrete, setLembrete] = useState("Sem lembrete");

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    toast.success("Demanda atualizada com sucesso!");
    navigate({ to: "/demandas" });
  };

  return (
    <AppLayout>
      <PageHeader
        icon={Edit}
        title="Editar Demanda"
        subtitle="Atualize os dados da demanda"
      />

      <div className="space-y-6">
        <form
          onSubmit={handleFormSubmit}
          className="rounded-[24px] border border-border bg-white p-8 shadow-sm"
        >
          <div className="space-y-5">
            <Field label="Título da Demanda" required>
              <input className={inputCls} defaultValue="Cesta básica" placeholder="Digite o título da demanda" />
            </Field>

            <Field label="Descrição" required>
              <textarea
                rows={4}
                className={textareaCls}
                defaultValue="Munícipe solicitou uma cesta básica"
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
                <input type="number" min={0} max={100} defaultValue={5} className={inputCls} placeholder="Ex: 5" />
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
                <input type="date" className={inputCls} defaultValue="2026-04-28" />
              </Field>

              <Field label="Contato Vinculado">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputCls} pl-9`}
                    defaultValue="Soraya Pereira"
                    placeholder="Digite para buscar contato..."
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Field>
              <Field label="Responsável">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`${inputCls} pl-9`}
                    defaultValue="Jhiovana Alcântara"
                    placeholder="Digite para buscar responsável..."
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Field>
            </div>

            <Field label="Observações">
              <textarea
                rows={3}
                className={textareaCls}
                defaultValue="Atendido na recepção por Selma no dia 28/04/2026"
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
              Atualizar Demanda
            </button>
          </div>
        </form>

        <div className="rounded-[24px] border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue-strong">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Histórico de Movimentação</h3>
              <p className="text-sm text-slate-500">Registro de todas as alterações realizadas nesta demanda</p>
            </div>
          </div>

          <div className="relative ml-6 border-l-2 border-slate-100 pb-4">
            <div className="mb-8 relative pl-8">
              <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brand-blue" />
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">jhiovana alcantara</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Criação</span>
                  </div>
                  <span className="text-sm text-slate-500">28/04/2026, 13:41</span>
                </div>
                <p className="text-slate-600">Demanda criada com status "Em Progresso"</p>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brand-blue" />
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">jhiovana alcantara</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Atualização</span>
                  </div>
                  <span className="text-sm text-slate-500">05/05/2026, 12:33</span>
                </div>
                <p className="text-slate-600">Título alterado</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar demanda?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente atualizar esta demanda? Verifique os dados informados antes de confirmar.
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
