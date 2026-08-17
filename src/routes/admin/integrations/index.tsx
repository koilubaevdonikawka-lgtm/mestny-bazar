import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIntegrationsStatus } from "@/api/integrations-status";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, Plug, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/integrations/")({
  component: AdminIntegrationsPage,
});

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Активна",
  STUB: "Заглушка",
  NOT_CONFIGURED: "Не настроена",
};

function AdminIntegrationsPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "integrations", "status"],
    queryFn: getIntegrationsStatus,
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
          <h1 className="font-serif text-3xl tracking-tight">Интеграции</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить интеграции";
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

        <h1 className="font-serif text-4xl tracking-tight">Интеграции</h1>

        <section className="mt-8 space-y-3">
          {status.integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-6"
            >
              <div className="min-w-0">
                <p className="font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {integration.port} → {integration.adapter}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {integration.secretConfigured !== null && (
                  <Badge variant={integration.secretConfigured ? "secondary" : "outline"}>
                    {integration.secretConfigured ? "Ключ настроен" : "Ключ не настроен"}
                  </Badge>
                )}
                <Badge variant={integration.status === "ACTIVE" ? "secondary" : "outline"}>
                  {STATUS_LABEL[integration.status] ?? integration.status}
                </Badge>
              </div>
            </div>
          ))}
          {status.integrations.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card p-6 py-8 text-center">
              <Plug className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Интеграций пока нет.</p>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
