import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listAuditLog } from "@/api/logs";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, FileText, Loader2, LogIn, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/logs/")({
  component: AdminLogsPage,
});

function AdminLogsPage() {
  const { isAuthenticated } = useSupabaseSession();
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);

  const filters = {
    action: action.trim() || undefined,
    entityType: entityType.trim() || undefined,
    page,
    pageSize: 25,
  };

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "logs", "list", filters],
    queryFn: () => listAuditLog(filters),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleFilterChange = () => setPage(1);

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
          <h1 className="font-serif text-3xl tracking-tight">Журналы событий</h1>
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

  if (isError || !result) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить журнал";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role") ||
      message.toLowerCase().includes("scope");

    return (
      <AdminLayout>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только администраторам.
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

        <h1 className="font-serif text-4xl tracking-tight">Журналы событий</h1>
        <p className="mt-2 text-muted-foreground">
          Неизменяемый журнал значимых действий платформы (см.{" "}
          <code className="text-sm">docs/admin-platform/logs.md</code>). Записи не редактируются и
          не удаляются.
        </p>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="log-action">Действие</Label>
              <Input
                id="log-action"
                value={action}
                onChange={(e) => {
                  setAction(e.target.value);
                  handleFilterChange();
                }}
                placeholder="например: order.confirmed"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="log-entity">Тип сущности</Label>
              <Input
                id="log-entity"
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value);
                  handleFilterChange();
                }}
                placeholder="например: order"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          {result.items.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Записей не найдено.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {result.items.map((entry) => (
                <li key={entry.id} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="text-sm font-medium">{entry.action}</code>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.occurredAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.entityType}:{entry.entityId}
                    {entry.actorId ? ` · исполнитель ${entry.actorId}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Назад
            </Button>
            <p className="text-sm text-muted-foreground">
              Страница {result.page} · всего {result.total}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={!result.hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Далее
            </Button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
