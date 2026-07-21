import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, X, Save } from "@/components/icons";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createDemanda } from "@/lib/demandas.functions";
import { listContatos } from "@/lib/contatos.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { ContactAutocomplete } from "@/components/ui/ContactAutocomplete";
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
  const queryClient = useQueryClient();
  const createFn = useServerFn(createDemanda);
  const listContFn = useServerFn(listContatos);
  const { data: contatos = [] } = useQuery({ queryKey: ["contatos"], queryFn: () => listContFn() });
  const contatoOptions = contatos.map((c: { codigo: string; nome: string }) => ({
    value: c.codigo || c.nome,
    label: c.nome,
    sublabel: c.codigo ? `#${c.codigo}` : undefined,
  }));

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataSolicitacao, setDataSolicitacao] = useState("");
  const [diasEstimados, setDiasEstimados] = useState<number>(5);
  const [contatoVinculado, setContatoVinculado] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [lembrete, setLembrete] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const computeVencimento = (baseDate: string, dias: number) => {
    if (!baseDate) return "";
    const d = new Date(baseDate + "T00:00:00");
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + (Number.isFinite(dias) ? dias : 0));
    return d.toISOString().slice(0, 10);
  };
  const vencimentoCalculado = computeVencimento(dataSolicitacao, diasEstimados);

  const mutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandas"] });
      toast.success("Demanda salva com sucesso!");
      navigate({ to: "/demandas" });
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao salvar"),
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Informe o título da demanda");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    const today = new Date().toISOString().slice(0, 10);
    mutation.mutate({
      data: {
        titulo,
        categoria,
        contato: contatoVinculado,
        cidade: "",
        descricao,
        dataSolicitacao: today,
        vencimento: prazo,
        observacoes,
        prioridade,
        status,
        responsavel,
      },
    });
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
            <input className={inputCls} placeholder="Digite o título da demanda" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </Field>

          <Field label="Descrição" required>
            <textarea
              rows={4}
              className={textareaCls}
              placeholder="Descreva os detalhes da demanda..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
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
            <Field label="Vencimento" required>
              <input type="date" className={inputCls} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
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
              placeholder="Observações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
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
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Salvando..." : "Salvar Demanda"}
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
