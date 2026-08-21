import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  assignAdminScope,
  assignRole,
  listUsers,
  revokeAdminScope,
  revokeRole,
  setCustomerBlocked,
} from "@/api/user-admin";
import type { UserRole } from "@shared/contracts/user";
import type { AdminScope } from "@shared/contracts/user-admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

// Roles/scopes render as a dense row of adjacent click-to-toggle badges — a
// stray click on the wrong one silently changed another admin's access with
// no way back except knowing to undo it manually. Every toggle now confirms
// through this single shared dialog before the mutation ever fires.
type PendingToggle =
  | { kind: "role"; userId: string; userName: string; role: UserRole; hasRole: boolean }
  | { kind: "scope"; userId: string; userName: string; scope: AdminScope; hasScope: boolean };

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

const ALL_ROLES: UserRole[] = ["admin", "customer", "warehouse", "courier", "seller"];
const ALL_SCOPES: AdminScope[] = ["finance", "marketing"];

function AdminUsersPage() {
  const { isAuthenticated } = useSupabaseSession();
  const queryClient = useQueryClient();
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "users", "list"],
    queryFn: listUsers,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users", "list"] });
  const onError = (fallback: string) => (e: unknown) =>
    toast.error(e instanceof Error ? e.message : fallback);

  const assignRoleMutation = useMutation({
    mutationFn: assignRole,
    onSuccess: invalidate,
    onError: onError("Не удалось назначить роль"),
  });
  const revokeRoleMutation = useMutation({
    mutationFn: revokeRole,
    onSuccess: invalidate,
    onError: onError("Не удалось отозвать роль"),
  });
  const assignScopeMutation = useMutation({
    mutationFn: assignAdminScope,
    onSuccess: invalidate,
    onError: onError("Не удалось назначить область доступа"),
  });
  const revokeScopeMutation = useMutation({
    mutationFn: revokeAdminScope,
    onSuccess: invalidate,
    onError: onError("Не удалось отозвать область доступа"),
  });
  const blockMutation = useMutation({
    mutationFn: setCustomerBlocked,
    onSuccess: invalidate,
    onError: onError("Не удалось изменить статус блокировки"),
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const confirmPendingToggle = () => {
    if (!pendingToggle) return;
    if (pendingToggle.kind === "role") {
      const { userId, role, hasRole } = pendingToggle;
      if (hasRole) {
        revokeRoleMutation.mutate({ userId, role });
      } else {
        assignRoleMutation.mutate({ userId, role });
      }
    } else {
      const { userId, scope, hasScope } = pendingToggle;
      if (hasScope) {
        revokeScopeMutation.mutate({ userId, scope });
      } else {
        assignScopeMutation.mutate({ userId, scope });
      }
    }
    setPendingToggle(null);
  };

  const pendingToggleText =
    pendingToggle?.kind === "role"
      ? {
          title: pendingToggle.hasRole ? "Отозвать роль?" : "Назначить роль?",
          description: pendingToggle.hasRole
            ? `Отозвать роль "${pendingToggle.role}" у пользователя ${pendingToggle.userName}?`
            : `Назначить роль "${pendingToggle.role}" пользователю ${pendingToggle.userName}?`,
        }
      : pendingToggle?.kind === "scope"
        ? {
            title: pendingToggle.hasScope ? "Убрать область доступа?" : "Включить область доступа?",
            description: pendingToggle.hasScope
              ? `Убрать scope "${pendingToggle.scope}" у пользователя ${pendingToggle.userName}?`
              : `Включить scope "${pendingToggle.scope}" для пользователя ${pendingToggle.userName}?`,
          }
        : null;

  if (isAuthenticated === null) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Пользователи</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить пользователей";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("out_of_scope") ||
      message.toLowerCase().includes("scope");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Управление ролями и правами не делегируется под-ролям администратора.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                Повторить
              </Button>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Административная платформа
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">Пользователи и права</h1>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!users || users.length === 0 ? (
            <div className="py-8 text-center">
              <UsersIcon className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Пользователей пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user.id} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.fullName ?? user.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.phone ?? "—"}</p>
                    </div>
                    {user.isBlocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={blockMutation.isPending}
                        onClick={() => blockMutation.mutate({ userId: user.id, isBlocked: false })}
                      >
                        Разблокировать
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={blockMutation.isPending}
                        onClick={() => blockMutation.mutate({ userId: user.id, isBlocked: true })}
                      >
                        Заблокировать
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {ALL_ROLES.map((role) => {
                      const has = user.roles.includes(role);
                      return (
                        <Badge
                          key={role}
                          variant={has ? "secondary" : "outline"}
                          className="cursor-pointer select-none"
                          onClick={() =>
                            setPendingToggle({
                              kind: "role",
                              userId: user.id,
                              userName: user.fullName ?? user.id,
                              role,
                              hasRole: has,
                            })
                          }
                        >
                          {role}
                        </Badge>
                      );
                    })}
                  </div>

                  {user.roles.includes("admin") && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ALL_SCOPES.map((scope) => {
                        const has = user.adminScopes.includes(scope);
                        return (
                          <Badge
                            key={scope}
                            variant={has ? "default" : "outline"}
                            className="cursor-pointer select-none"
                            onClick={() =>
                              setPendingToggle({
                                kind: "scope",
                                userId: user.id,
                                userName: user.fullName ?? user.id,
                                scope,
                                hasScope: has,
                              })
                            }
                          >
                            admin-{scope}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <AlertDialog
        open={pendingToggle !== null}
        onOpenChange={(open) => !open && setPendingToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingToggleText?.title}</AlertDialogTitle>
            <AlertDialogDescription>{pendingToggleText?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPendingToggle}>Подтвердить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
