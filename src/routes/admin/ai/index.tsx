import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAIWorkersStatus } from "@/api/ai";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Bot, Loader2, LogIn, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/ai/")({
  component: AdminAIPage,
});

function AdminAIPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "ai", "workers"],
    queryFn: getAIWorkersStatus,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

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
          <h1 className="font-serif text-3xl tracking-tight">ИИ-инструменты</h1>
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

  if (isError || !status) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить ИИ-инструменты";
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
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Административная платформа
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">ИИ-инструменты</h1>

        {!status.resultsPersisted && (
          <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
            Результаты анализа существуют только как событие в момент публикации и нигде не
            сохраняются — известное, задокументированное ограничение (см.{" "}
            <code className="text-sm">ai.md</code>, «Будущие расширения»).
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Воркеры</h2>
          {status.workers.length === 0 ? (
            <div className="py-8 text-center">
              <Bot className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Воркеров пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {status.workers.map((worker) => (
                <li
                  key={worker.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <code className="text-sm font-medium">{worker.id}</code>
                  <Badge variant="secondary">Активен</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
