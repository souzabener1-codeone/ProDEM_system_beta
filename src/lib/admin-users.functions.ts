import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  status: "active" | "inactive";
  role: "admin" | "user";
  created_at: string;
};

async function assertCallerIsAdmin(context: {
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>;
  userId: string;
}): Promise<void> {
  const { data, error } = await context.supabase.rpc("is_admin");
  if (error) {
    console.error("[admin-users] is_admin rpc error", error);
    throw new Error("Não foi possível validar suas permissões.");
  }
  if (!data) {
    throw new Error("Acesso restrito a administradores.");
  }
}

// ---------- List ----------

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminUserRow[]> => {
    await assertCallerIsAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profilesRes, rolesRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, status, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);

    if (profilesRes.error) throw new Error(profilesRes.error.message);
    if (rolesRes.error) throw new Error(rolesRes.error.message);

    const roleByUser = new Map<string, "admin" | "user">();
    for (const r of rolesRes.data ?? []) {
      const current = roleByUser.get(r.user_id);
      // Prefer admin if user has multiple rows
      if (current !== "admin") roleByUser.set(r.user_id, r.role as "admin" | "user");
    }

    return (profilesRes.data ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      status: (p.status === "active" ? "active" : "inactive") as "active" | "inactive",
      role: roleByUser.get(p.id) ?? "user",
      created_at: p.created_at,
    }));
  });

// ---------- Create ----------

const createInput = z.object({
  full_name: z.string().trim().min(1, "Nome obrigatório").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  role: z.enum(["admin", "user"]),
});

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Create the auth user (email confirmed so they can immediately reset password)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (createErr || !created?.user) {
      console.error("[admin-users] createUser error", createErr);
      throw new Error(createErr?.message ?? "Falha ao criar usuário.");
    }

    const newUserId = created.user.id;

    // 2) Trigger handle_new_user inserts profile + default 'user' role.
    //    Ensure full_name is correct even if metadata key differed.
    await supabaseAdmin
      .from("profiles")
      .update({ full_name: data.full_name, email: data.email })
      .eq("id", newUserId);

    // 3) If role should be admin, upsert admin role
    if (data.role === "admin") {
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: newUserId, role: "admin" }, { onConflict: "user_id,role" });
      if (roleErr) {
        console.error("[admin-users] role upsert error", roleErr);
        throw new Error("Usuário criado, mas não foi possível atribuir o perfil admin.");
      }
    }

    // 4) Send password-reset email so the user defines their own password
    const redirectTo =
      (process.env.SITE_URL ?? "").replace(/\/$/, "") + "/reset-password" || undefined;
    const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: redirectTo || undefined,
    });
    if (resetErr) {
      console.warn("[admin-users] resetPasswordForEmail error", resetErr);
      // Não bloqueia; usuário foi criado.
    }

    return { ok: true, user_id: newUserId };
  });

// ---------- Set status ----------

const statusInput = z.object({
  user_id: z.string().uuid(),
  status: z.enum(["active", "inactive"]),
});

export const setAdminUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => statusInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Impede que o admin desative a si mesmo
    if (data.status === "inactive" && data.user_id === (context as { userId: string }).userId) {
      throw new Error("Você não pode desativar sua própria conta.");
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Reset password ----------

const resetInput = z.object({ email: z.string().trim().email() });

export const sendAdminUserPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resetInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCallerIsAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const redirectTo =
      (process.env.SITE_URL ?? "").replace(/\/$/, "") + "/reset-password" || undefined;
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(data.email, {
      redirectTo: redirectTo || undefined,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
