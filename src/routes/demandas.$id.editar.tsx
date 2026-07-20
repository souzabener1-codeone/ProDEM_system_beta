import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { X, Save, Edit, Clock } from "@/components/icons";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { ContactAutocomplete } from "@/components/ui/ContactAutocomplete";
import { MovimentacaoStepper } from "@/components/demandas/MovimentacaoStepper";
import { listDemandas, type Demanda } from "@/lib/demandas.functions";
import { listContatos } from "@/lib/contatos.functions";
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
  const { id } = Route.useParams();
  const listDemFn = useServerFn(listDemandas);
  const { data: rawDemandas, isLoading } = useQuery({
    queryKey: ["demandas"],
    queryFn: () => listDemFn(),
  });

  const index = Number(id);
  const demanda: Demanda | undefined =
    rawDemandas && Number.isFinite(index) ? rawDemandas[index] : undefined;

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader icon={Edit} title="Editar Demanda" subtitle="Carregando dados da demanda…" />
      </AppLayout>
    );
  }

  if (!demanda) {
    return (
      <AppLayout>
        <PageHeader icon={Edit} title="Editar Demanda" subtitle="Demanda não encontrada" />
        <div className="rounded-[24px] border border-border bg-white p-8 text-sm text-slate-600 shadow-sm">
          Não foi possível localizar a demanda solicitada.{" "}
          <Link to="/demandas" className="text-brand-blue underline">
            Voltar para a lista
          </Link>
          .
        </div>
      </AppLayout>
    );
  }

  return <EditarDemandaForm demanda={demanda} />;
}

function EditarDemandaForm({ demanda }: { demanda: Demanda }) {
  const navigate = useNavigate();
  const listContFn = useServerFn(listContatos);
  const { data: contatos = [] } = useQuery({ queryKey: ["contatos"], queryFn: () => listContFn() });
  const contatoOptions = contatos.map((c: { codigo: string; nome: string }) => ({
    value: c.codigo || c.nome,
    label: c.nome,
    sublabel: c.codigo ? `#${c.codigo}` : undefined,
  }));

  const [status, setStatus] = useState(demanda.status || "");
  const [categoria, setCategoria] = useState(demanda.categoria || "");
  const [prioridade, setPrioridade] = useState(demanda.prioridade || "Média");
  const [lembrete, setLembrete] = useState("Sem lembrete");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contatoVinculado, setContatoVinculado] = useState(demanda.contato || "");
  const [responsavel, setResponsavel] = useState((demanda as any).responsavel ?? "");

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
              <input className={inputCls} defaultValue={demanda.titulo} placeholder="Digite o título da demanda" />
            </Field>

            <Field label="Descrição" required>
              <textarea
                rows={4}
                className={textareaCls}
                defaultValue={demanda.descricao}
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
                <input type="date" className={inputCls} defaultValue={demanda.dataSolicitacao} />
              </Field>

              <Field label="Contato Vinculado">
                <div className="rounded-[16px] border border-slate-200 bg-slate-50/50 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
                  <ContactAutocomplete
                    placeholder="Digite para buscar contato..."
                    value={contatoVinculado}
                    onChange={setContatoVinculado}
                    options={contatoOptions}
                    onCreateNew={() => navigate({ to: "/contatos/novo" })}
                    createNewLabel="Cadastrar novo contato"
                  />
                </div>
              </Field>
              <Field label="Responsável">
                <div className="rounded-[16px] border border-slate-200 bg-slate-50/50 focus-within:border-brand-blue focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
                  <ContactAutocomplete
                    placeholder="Digite para buscar responsável..."
                    value={responsavel}
                    onChange={setResponsavel}
                    options={contatoOptions}
                  />
                </div>
              </Field>
            </div>

            <Field label="Observações">
              <textarea
                rows={3}
                className={textareaCls}
                defaultValue={demanda.observacoes}
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

          <MovimentacaoStepper currentStepId={status === "Concluída" || status === "concluida" ? "concluida" : "em-progresso"} />
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
