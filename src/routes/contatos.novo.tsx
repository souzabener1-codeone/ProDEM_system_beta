import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { UserPlus, X, Save } from "@/components/icons";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createContato } from "@/lib/contatos.functions";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { SimpleSelect } from "@/components/ui/SimpleSelect";
import { useCepLookup } from "@/hooks/useCepLookup";
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

const contactTypes = [
  { value: "Parlamentar", label: "Parlamentar" },
  { value: "Autoridade", label: "Autoridade" },
  { value: "Assessor", label: "Assessor" },
  { value: "Funcionário", label: "Funcionário" },
  { value: "Jornalista", label: "Jornalista" },
  { value: "Mídia", label: "Mídia" },
  { value: "Empresário", label: "Empresário" },
  { value: "Empresa", label: "Empresa" },
  { value: "Cidadão", label: "Cidadão" },
  { value: "Liderança", label: "Liderança" },
];

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
  const queryClient = useQueryClient();
  const createFn = useServerFn(createContato);

  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [numero, setNumero] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [tipoContato, setTipoContato] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatos"] });
      toast.success("Contato salvo com sucesso!");
      navigate({ to: "/contatos" });
    },
    onError: (err: Error) => toast.error(err.message || "Erro ao salvar"),
  });

  const { status: cepStatus, data: cepData, errorMessage: cepError, lookupCep } = useCepLookup();

  useEffect(() => {
    setCepLoading(cepStatus === "loading");
  }, [cepStatus]);

  useEffect(() => {
    if (cepStatus === "success" && cepData) {
      setEndereco(cepData.logradouro);
      setBairro(cepData.bairro);
      setCidade(cepData.cidade);
      setEstado(cepData.uf);
      if (cepData.complemento) setComplemento(cepData.complemento);
    } else if (cepStatus === "not_found" || cepStatus === "error") {
      if (cepError) toast.error(cepError);
    }
  }, [cepStatus, cepData, cepError]);

  const handleCepChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    lookupCep(digits);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome completo");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const localizacao = [cidade, estado].filter(Boolean).join("/");
    mutation.mutate({ data: { codigo, nome, tipo: tipoContato, telefone, localizacao } });
  };


  return (
    <AppLayout>
      <PageHeader
        icon={UserPlus}
        title="Novo Contato"
        subtitle="Cadastre um novo contato"
      />

      <form onSubmit={handleFormSubmit} className="rounded-[24px] border border-border bg-white p-8 shadow-sm">
        <div className="space-y-10">
          {/* Dados Pessoais */}
          <section>
            <h2 className="text-[15px] font-medium text-slate-800">Dados Pessoais</h2>
            <hr className="mb-6 mt-3 border-slate-100" />
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Nome Completo" required>
                  <input className={inputCls} placeholder="Digite o nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
                </Field>
              </div>
              <Field label="Tipo de Contato" required>
                <SimpleSelect
                  value={tipoContato}
                  onValueChange={setTipoContato}
                  placeholder="Selecione o tipo de contato"
                  options={contactTypes}
                />
              </Field>
              <Field label="CPF/CNPJ">
                <input className={inputCls} placeholder="000.000.000-00" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Informações de Contato */}
          <section>
            <h2 className="text-[15px] font-medium text-slate-800">Informações de Contato</h2>
            <hr className="mb-6 mt-3 border-slate-100" />
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field label="Telefone">
                <input className={inputCls} placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                  <input
                    className={inputCls}
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                </Field>
                <p className="mt-2 text-xs text-slate-500">
                  {cepLoading ? "Buscando endereço..." : "Digite o CEP para preencher o endereço automaticamente"}
                </p>
              </div>
              <div className="md:col-span-7">
                <Field label="Endereço">
                  <input
                    className={inputCls}
                    placeholder="Rua, Avenida..."
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Número">
                  <input className={inputCls} placeholder="Nº" value={numero} onChange={(e) => setNumero(e.target.value)} />
                </Field>
              </div>

              <div className="md:col-span-4">
                <Field label="Complemento">
                  <input
                    className={inputCls}
                    placeholder="Apto, Bloco, Sala..."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-4">
                <Field label="Bairro">
                  <input
                    className={inputCls}
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-4">
                <Field label="Cidade">
                  <input
                    className={inputCls}
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </Field>
              </div>

              <div className="md:col-span-4">
                <Field label="Estado">
                  <select
                    className={inputCls}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="">-</option>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
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
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
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
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-blue-strong active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Salvando..." : "Salvar Contato"}
          </button>
        </div>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salvar contato?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente salvar este contato? Verifique os dados informados antes de confirmar.
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

