import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSecurityOverview } from "@/api/security-overview";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Loader2, LogIn, ShieldAlert, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/security/")({
  component: AdminSecurityPage,
});

function AdminSecurityPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "security", "overview"],
    queryFn: getSecurityOverview,
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
          <h1 className="font-serif text-3xl tracking-tight">Безопасность</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить безопасность";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");

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

        <h1 className="font-serif text-4xl tracking-tight">Безопасность</h1>
        <p className="mt-2 text-muted-foreground">
          Периметр безопасности платформы (см.{" "}
          <code className="text-sm">docs/admin-platform/security.md</code>
          ).
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Периметр</h2>
          <ul className="space-y-3">
            {overview.perimeter.map((item) => (
              <li
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.mechanism}</p>
                </div>
                <Badge variant={item.status === "IMPLEMENTED" ? "secondary" : "outline"}>
                  {item.status === "IMPLEMENTED" ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> В норме
                    </span>
                  ) : (
                    "Требует внимания"
                  )}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Известные пробелы</h2>
          <ul className="space-y-3">
            {overview.gaps.map((gap) => (
              <li key={gap.name} className="rounded-xl bg-secondary/40 px-4 py-3">
                <p className="font-medium">{gap.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{gap.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
