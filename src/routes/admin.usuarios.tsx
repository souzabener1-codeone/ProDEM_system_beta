import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserCog, Plus, RefreshCw, Loader2 } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  listAdminUsers,
  createAdminUser,
  setAdminUserStatus,
  sendAdminUserPasswordReset,
  type AdminUserRow,
} from "@/lib/admin-users.functions";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — PRODEM" },
      { name: "description", content: "Gerenciamento de usuários do sistema." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsuariosPage,
});

function AdminUsuariosPage() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const listFn = useServerFn(listAdminUsers);
  const createFn = useServerFn(createAdminUser);
  const statusFn = useServerFn(setAdminUserStatus);
  const resetFn = useServerFn(sendAdminUserPasswordReset);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn(),
    enabled: !authLoading && isAdmin,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createMut = useMutation({
    mutationFn: (data: { full_name: string; email: string; role: "admin" | "user" }) =>
      createFn({ data }),
    onSuccess: () => {
      toast.success("Usuário criado. E-mail de definição de senha enviado.");
      void invalidate();
    },
    onError: (err: Error) => toast.error(err.message ?? "Falha ao criar usuário."),
  });

  const statusMut = useMutation({
    mutationFn: (data: { user_id: string; status: "active" | "inactive" }) =>
      statusFn({ data }),
    onSuccess: (_res, vars) => {
      toast.success(vars.status === "active" ? "Usuário reativado." : "Usuário desativado.");
      void invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetMut = useMutation({
    mutationFn: (data: { email: string }) => resetFn({ data }),
    onSuccess: () => toast.success("E-mail de redefinição enviado."),
    onError: (err: Error) => toast.error(err.message),
  });

  if (!authLoading && !isAdmin) {
    // Guard já redireciona; renderiza vazio como fallback.
    navigate({ to: "/", replace: true });
    return null;
  }

  return (
    <AppLayout>
      <PageHeader
        icon={UserCog}
        title="Usuários"
        subtitle="Gerencie os usuários e permissões do sistema."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => void invalidate()}
              className="rounded-[12px]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <CreateUserDialog
              onSubmit={(v) => createMut.mutateAsync(v)}
              submitting={createMut.isPending}
            />
          </div>
        }
      />

      <div className="rounded-[16px] border border-border bg-card p-4 shadow-sm">
        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-blue" />
          </div>
        ) : usersQuery.isError ? (
          <div className="py-12 text-center text-sm text-danger">
            Falha ao carregar usuários. Tente novamente.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usersQuery.data ?? []).map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={u.id === user?.id}
                  onToggleStatus={(status) =>
                    statusMut.mutate({ user_id: u.id, status })
                  }
                  onSendReset={() =>
                    u.email && resetMut.mutate({ email: u.email })
                  }
                  pending={
                    statusMut.isPending || resetMut.isPending
                  }
                />
              ))}
              {(usersQuery.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </AppLayout>
  );
}

function UserRow({
  user,
  isSelf,
  onToggleStatus,
  onSendReset,
  pending,
}: {
  user: AdminUserRow;
  isSelf: boolean;
  onToggleStatus: (status: "active" | "inactive") => void;
  onSendReset: () => void;
  pending: boolean;
}) {
  const nextStatus: "active" | "inactive" =
    user.status === "active" ? "inactive" : "active";
  const created = user.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR")
    : "—";
  return (
    <TableRow>
      <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
      <TableCell className="text-muted-foreground">{user.email || "—"}</TableCell>
      <TableCell>
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role === "admin" ? "Admin" : "Usuário"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.status === "active" ? "default" : "outline"}
          className={
            user.status === "active"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
              : "bg-slate-200 text-slate-700 hover:bg-slate-200"
          }
        >
          {user.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{created}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-[12px]"
            disabled={pending || !user.email}
            onClick={onSendReset}
          >
            Reenviar senha
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={user.status === "active" ? "destructive" : "default"}
                size="sm"
                className="rounded-[12px]"
                disabled={pending || isSelf}
                title={isSelf ? "Você não pode alterar seu próprio status" : ""}
              >
                {user.status === "active" ? "Desativar" : "Reativar"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {nextStatus === "inactive" ? "Desativar usuário?" : "Reativar usuário?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {nextStatus === "inactive"
                    ? "O usuário perderá acesso imediato ao sistema."
                    : "O usuário poderá acessar o sistema novamente."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onToggleStatus(nextStatus)}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
}

function CreateUserDialog({
  onSubmit,
  submitting,
}: {
  onSubmit: (data: { full_name: string; email: string; role: "admin" | "user" }) => Promise<unknown>;
  submitting: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({ full_name: fullName.trim(), email: email.trim(), role });
      setFullName("");
      setEmail("");
      setRole("user");
      setOpen(false);
    } catch {
      /* erro tratado no onError */
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-[12px]">
          <Plus className="mr-2 h-4 w-4" />
          Novo usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="user-name">Nome completo</Label>
              <Input
                id="user-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={120}
                className="mt-1 rounded-[16px]"
              />
            </div>
            <div>
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="mt-1 rounded-[16px]"
              />
            </div>
            <div>
              <Label htmlFor="user-role">Perfil</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "user")}>
                <SelectTrigger id="user-role" className="mt-1 rounded-[16px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Um e-mail será enviado para o usuário definir a própria senha.
            </p>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-[12px]">
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-[12px]">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
