import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAutomationOverview } from "@/api/automation";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/automation/")({
  component: AdminAutomationPage,
});

function AdminAutomationPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "automation", "overview"],
    queryFn: getAutomationOverview,
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
          <h1 className="font-serif text-3xl tracking-tight">Автоматизация</h1>
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

  if (isError || !overview) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить автоматизацию";
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

        <h1 className="font-serif text-4xl tracking-tight">Автоматизация</h1>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {overview.events.length === 0 ? (
            <div className="py-8 text-center">
              <Zap className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Событий пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {overview.events.map((event) => (
                <li key={event.eventType} className="rounded-xl bg-secondary/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <code className="text-sm font-medium">{event.eventType}</code>
                    <div className="flex flex-wrap gap-1">
                      {event.subscribers.length === 0 ? (
                        <Badge variant="outline">без подписчиков</Badge>
                      ) : (
                        event.subscribers.map((subscriber) => (
                          <Badge key={subscriber} variant="secondary">
                            {subscriber}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
