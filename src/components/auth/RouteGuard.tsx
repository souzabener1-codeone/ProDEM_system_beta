import { useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2 } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PUBLIC_ROUTES = ["/login", "/reset-password"];

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

export function RouteGuard({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const publicRoute = isPublic(pathname);

  // Bloqueia usuários inativos (segurança em profundidade — o servidor também barra via RLS/status).
  useEffect(() => {
    if (loading) return;
    if (session && profile && profile.status !== "active") {
      toast.error("Conta inativa. Contate o administrador.");
      void supabase.auth.signOut();
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, profile, navigate]);

  // Redireciona rotas protegidas para /login quando não há sessão.
  useEffect(() => {
    if (loading) return;
    if (!session && !publicRoute) {
      navigate({ to: "/login", replace: true });
    }
  }, [loading, session, publicRoute, navigate]);

  // Redireciona /login para "/" quando já autenticado.
  useEffect(() => {
    if (loading) return;
    if (session && profile?.status === "active" && pathname === "/login") {
      navigate({ to: "/", replace: true });
    }
  }, [loading, session, profile, pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!session && !publicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
      </div>
    );
  }

  return <>{children}</>;
}
