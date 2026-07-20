import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "@/components/icons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import prodemLogo from "@/assets/prodem-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — PRODEM" },
      { name: "description", content: "Acesso ao sistema PRODEM." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        toast.error("Credenciais inválidas. Verifique e-mail e senha.");
        return;
      }

      // Checagem de status: bloqueia contas inativas mesmo com senha correta.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("[login] profile fetch error", profileError);
        await supabase.auth.signOut();
        toast.error("Não foi possível validar sua conta. Tente novamente.");
        return;
      }

      if (!profile || profile.status !== "active") {
        await supabase.auth.signOut();
        toast.error("Conta inativa. Contate o administrador.");
        return;
      }

      toast.success("Login realizado com sucesso.");
      navigate({ to: "/", replace: true });
    } catch (err) {
      console.error("[login] unexpected error", err);
      toast.error("Erro inesperado ao entrar. Tente novamente.");
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
          <h1 className="text-xl font-semibold text-foreground">Acessar o sistema</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe suas credenciais para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[16px] border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Entrando..." : "Entrar"}
            </button>

            <div className="flex justify-center pt-2">
              <Link
                to="/reset-password"
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
