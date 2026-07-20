import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "@/components/icons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import prodemLogo from "@/assets/prodem-logo.png.asset.json";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — PRODEM" },
      { name: "description", content: "Recupere ou redefina sua senha." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Detecta se veio via link de recuperação (Supabase envia type=recovery no hash).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setMode("update");
    }
  }, []);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        console.error("[reset-password] request error", error);
        toast.error("Não foi possível enviar o e-mail. Verifique o endereço informado.");
        return;
      }
      toast.success("Se o e-mail existir, um link de recuperação foi enviado.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("[reset-password] update error", error);
        toast.error("Não foi possível atualizar sua senha. Solicite um novo link.");
        return;
      }
      toast.success("Senha redefinida com sucesso.");
      await supabase.auth.signOut();
      navigate({ to: "/login", replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex w-full max-w-[220px] items-center justify-center rounded-2xl bg-navy-800 px-6 py-6 shadow-sm">
            <img
              src={prodemLogo.url}
              alt="PRODEM — Tecnologia & Inovação"
              className="h-auto w-full max-w-[180px] object-contain"
            />
          </div>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "request" ? "Recuperar senha" : "Definir nova senha"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "request"
              ? "Informe seu e-mail e enviaremos um link para redefinir sua senha."
              : "Escolha uma nova senha para acessar o sistema."}
          </p>

          {mode === "request" ? (
            <form onSubmit={handleRequest} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[16px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="voce@gabinete.gov.br"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdate} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[16px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Mínimo de 8 caracteres"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                  Confirmar senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-[16px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Repita a senha"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          )}

          <div className="mt-4 flex justify-center">
            <Link to="/login" className="text-sm font-medium text-brand-blue hover:underline">
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
