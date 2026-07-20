/**
 * Access-control helpers shared by Contatos/Demandas server functions.
 *
 * Enforced entirely on the server (Sheets is the data store — there is no RLS),
 * so every mutation/query that must be restricted has to call one of these
 * assertions inside the handler.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AuthContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

/**
 * Ensures the caller is authenticated AND has profiles.status = 'active'.
 * Throws a plain Error otherwise. Use for read/create/update handlers.
 */
export async function assertActiveStaff(context: AuthContext): Promise<void> {
  const { data, error } = await context.supabase
    .from("profiles")
    .select("status")
    .eq("id", context.userId)
    .maybeSingle();

  if (error) {
    console.error("[access-control] profile lookup error", error);
    throw new Error("Não foi possível validar sua conta.");
  }
  if (!data || data.status !== "active") {
    throw new Error("Conta inativa. Contate o administrador.");
  }
}

/**
 * Ensures the caller is an admin. Use for delete handlers or other
 * privileged actions. Relies on the security-definer is_admin() function.
 */
export async function assertAdmin(context: AuthContext): Promise<void> {
  const { data, error } = await context.supabase.rpc("is_admin");
  if (error) {
    console.error("[access-control] is_admin rpc error", error);
    throw new Error("Não foi possível validar suas permissões.");
  }
  if (!data) {
    throw new Error("Acesso restrito a administradores.");
  }
}
