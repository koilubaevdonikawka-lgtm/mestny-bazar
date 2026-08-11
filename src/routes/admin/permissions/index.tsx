import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  assignRoleToUser,
  createPermission,
  createRole,
  deletePermission,
  deleteRole,
  getRole,
  listPermissions,
  listRoles,
  listUserRoleAssignments,
  revokeRoleFromUser,
  setRolePermissions,
} from "@/api/rbac";
import { listUsers } from "@/api/user-admin";
import type { RbacPermissionDTO, RbacRoleDTO } from "@shared/contracts/rbac";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, Lock, LogIn, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/permissions/")({
  component: AdminPermissionsPage,
});

type Tab = "roles" | "permissions" | "matrix" | "assignments";

function AdminPermissionsPage() {
  const { isAuthenticated } = useSupabaseSession();
  const [tab, setTab] = useState<Tab>("roles");

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const rolesQuery = useQuery({
    queryKey: ["admin", "permissions", "roles"],
    queryFn: listRoles,
    enabled: isAuthenticated === true,
    retry: false,
  });

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
          <h1 className="font-serif text-3xl tracking-tight">Права доступа</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью администратора.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (rolesQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (rolesQuery.isError) {
    const message =
      rolesQuery.error instanceof Error ? rolesQuery.error.message : "Не удалось загрузить роли";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("permission denied");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только пользователям с ролью, дающей доступ к модулю «Права
                доступа».
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              <Button
                size="lg"
                className="mt-6 h-12 rounded-full"
                onClick={() => void rolesQuery.refetch()}
              >
                Повторить
              </Button>
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  const roles = rolesQuery.data ?? [];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Административная платформа
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <Lock className="h-7 w-7 text-primary" />
          <h1 className="font-serif text-4xl tracking-tight">Права доступа</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Роли, разрешения и назначение ролей пользователям. Изменения вступают в силу сразу после
          сохранения.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["roles", "Роли"],
              ["permissions", "Разрешения"],
              ["matrix", "Матрица прав"],
              ["assignments", "Назначение ролей"],
            ] as [Tab, string][]
          ).map(([value, label]) => (
            <Button
              key={value}
              variant={tab === value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setTab(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "roles" && <RolesTab roles={roles} />}
          {tab === "permissions" && <PermissionsTab />}
          {tab === "matrix" && <MatrixTab roles={roles} />}
          {tab === "assignments" && <AssignmentsTab roles={roles} />}
        </div>
      </div>
    </AdminLayout>
  );
}

function RolesTab({ roles }: { roles: RbacRoleDTO[] }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "roles"] });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      invalidate();
      toast.success("Роль создана");
      setName("");
      setDescription("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать роль"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      invalidate();
      toast.success("Роль удалена");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось удалить роль"),
  });

  return (
    <div className="space-y-6">
      <AdminDataTable
        rows={roles}
        getRowId={(role) => role.id}
        searchFn={(role, q) => role.name.toLowerCase().includes(q)}
        searchPlaceholder="Поиск роли..."
        columns={[
          {
            key: "name",
            header: "Название",
            sortable: true,
            sortValue: (role) => role.name,
            render: (role) => (
              <div>
                <p className="font-medium">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                )}
              </div>
            ),
          },
          {
            key: "type",
            header: "Тип",
            className: "w-32 shrink-0",
            render: (role) => (
              <Badge variant={role.isSystem ? "secondary" : "outline"}>
                {role.isSystem ? "Системная" : "Своя"}
              </Badge>
            ),
          },
        ]}
        rowActions={(role) => (
          <Button
            variant="ghost"
            size="sm"
            disabled={role.isSystem || deleteMutation.isPending}
            title={role.isSystem ? "Системная роль" : "Удалить"}
            onClick={() => deleteMutation.mutate(role.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        emptyState="Ролей пока нет."
      />

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-serif text-2xl mb-4">Новая роль</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) {
              toast.error("Название должно содержать минимум 2 символа");
              return;
            }
            createMutation.mutate({ name: name.trim(), description: description.trim() || null });
          }}
          className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div className="grid gap-2">
            <Label htmlFor="role-name">Название</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role-desc">Описание</Label>
            <Input
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <Button type="submit" className="h-10 rounded-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
          </Button>
        </form>
      </section>
    </div>
  );
}

function PermissionsTab() {
  const queryClient = useQueryClient();
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");

  const permissionsQuery = useQuery({
    queryKey: ["admin", "permissions", "catalog"],
    queryFn: listPermissions,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "catalog"] });

  const createMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      invalidate();
      toast.success("Разрешение создано");
      setModule("");
      setAction("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось создать разрешение"),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: () => {
      invalidate();
      toast.success("Разрешение удалено");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось удалить разрешение"),
  });

  const permissions = permissionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <AdminDataTable
        rows={permissions}
        getRowId={(p) => p.id}
        searchFn={(p, q) => `${p.module} ${p.action}`.toLowerCase().includes(q)}
        searchPlaceholder="Поиск разрешения..."
        columns={[
          {
            key: "module",
            header: "Модуль",
            sortable: true,
            sortValue: (p: RbacPermissionDTO) => p.module,
            render: (p: RbacPermissionDTO) => <span className="font-medium">{p.module}</span>,
          },
          {
            key: "action",
            header: "Действие",
            sortable: true,
            sortValue: (p: RbacPermissionDTO) => p.action,
            render: (p: RbacPermissionDTO) => <span>{p.action}</span>,
          },
          {
            key: "type",
            header: "Тип",
            className: "w-32 shrink-0",
            render: (p: RbacPermissionDTO) => (
              <Badge variant={p.isSystem ? "secondary" : "outline"}>
                {p.isSystem ? "Системное" : "Своё"}
              </Badge>
            ),
          },
        ]}
        rowActions={(p: RbacPermissionDTO) => (
          <Button
            variant="ghost"
            size="sm"
            disabled={p.isSystem || deleteMutation.isPending}
            title={p.isSystem ? "Системное разрешение" : "Удалить"}
            onClick={() => deleteMutation.mutate(p.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        emptyState="Разрешений пока нет."
      />

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-serif text-2xl mb-4">Новое разрешение</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!module.trim() || !action.trim()) {
              toast.error("Укажите модуль и действие");
              return;
            }
            createMutation.mutate({ module: module.trim(), action: action.trim() });
          }}
          className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <div className="grid gap-2">
            <Label htmlFor="perm-module">Модуль</Label>
            <Input
              id="perm-module"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              placeholder="например: couriers"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="perm-action">Действие</Label>
            <Input
              id="perm-action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="например: view"
            />
          </div>
          <Button type="submit" className="h-10 rounded-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
          </Button>
        </form>
      </section>
    </div>
  );
}

function MatrixTab({ roles }: { roles: RbacRoleDTO[] }) {
  const [roleId, setRoleId] = useState<string>(roles[0]?.id ?? "");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const permissionsQuery = useQuery({
    queryKey: ["admin", "permissions", "catalog"],
    queryFn: listPermissions,
  });

  const roleQuery = useQuery({
    queryKey: ["admin", "permissions", "role", roleId],
    queryFn: () => getRole(roleId),
    enabled: !!roleId,
  });

  useMemo(() => {
    if (roleQuery.data) {
      setChecked(new Set(roleQuery.data.permissions.map((p) => p.id)));
    }
  }, [roleQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => setRolePermissions({ roleId, permissionIds: [...checked] }),
    onSuccess: () => {
      toast.success("Матрица прав сохранена");
      queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "role", roleId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось сохранить матрицу"),
  });

  const permissionsByModule = useMemo(() => {
    const map = new Map<string, RbacPermissionDTO[]>();
    for (const p of permissionsQuery.data ?? []) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return map;
  }, [permissionsQuery.data]);

  if (roles.length === 0) {
    return <p className="text-muted-foreground">Сначала создайте роль.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Выберите роль" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="rounded-full"
          disabled={saveMutation.isPending || !roleId}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
        </Button>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        {roleQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {[...permissionsByModule.entries()].map(([module, permissions]) => (
              <div key={module}>
                <h3 className="font-medium mb-2">{module}</h3>
                <div className="grid gap-2 sm:grid-cols-3">
                  {permissions.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={checked.has(p.id)}
                        onCheckedChange={(value) => {
                          setChecked((prev) => {
                            const next = new Set(prev);
                            if (value) next.add(p.id);
                            else next.delete(p.id);
                            return next;
                          });
                        }}
                      />
                      {p.action}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AssignmentsTab({ roles }: { roles: RbacRoleDTO[] }) {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const usersQuery = useQuery({ queryKey: ["admin", "users", "list"], queryFn: listUsers });
  const assignmentsQuery = useQuery({
    queryKey: ["admin", "permissions", "assignments"],
    queryFn: () => listUserRoleAssignments(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "permissions", "assignments"] });

  const assignMutation = useMutation({
    mutationFn: assignRoleToUser,
    onSuccess: () => {
      invalidate();
      toast.success("Роль назначена");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось назначить роль"),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeRoleFromUser,
    onSuccess: () => {
      invalidate();
      toast.success("Роль отозвана");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось отозвать роль"),
  });

  const users = (usersQuery.data ?? []).filter((u) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (u.fullName ?? "").toLowerCase().includes(q) || (u.phone ?? "").includes(q);
  });

  const assignmentsByUser = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of assignmentsQuery.data ?? []) {
      const list = map.get(a.userId) ?? [];
      list.push(a.roleId);
      map.set(a.userId, list);
    }
    return map;
  }, [assignmentsQuery.data]);

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск пользователя по имени или телефону..."
        className="max-w-sm"
      />

      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <ul className="space-y-3">
          {users.map((user) => {
            const assignedRoleIds = new Set(assignmentsByUser.get(user.id) ?? []);
            return (
              <li key={user.id} className="rounded-xl bg-secondary/40 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{user.fullName ?? "Без имени"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.phone ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const isAssigned = assignedRoleIds.has(role.id);
                    return (
                      <Button
                        key={role.id}
                        size="sm"
                        variant={isAssigned ? "default" : "outline"}
                        disabled={assignMutation.isPending || revokeMutation.isPending}
                        onClick={() =>
                          isAssigned
                            ? revokeMutation.mutate({ userId: user.id, roleId: role.id })
                            : assignMutation.mutate({ userId: user.id, roleId: role.id })
                        }
                      >
                        {role.name}
                      </Button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
