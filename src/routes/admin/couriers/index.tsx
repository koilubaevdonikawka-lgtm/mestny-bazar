import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listCouriers } from "@/api/courier-admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, Bike, Loader2, LogIn, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/couriers/")({
  component: AdminCouriersPage,
});

function AdminCouriersPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: couriers,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "couriers", "list"],
    queryFn: listCouriers,
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
          <h1 className="font-serif text-3xl tracking-tight">Курьеры</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить курьеров";
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

        <h1 className="font-serif text-4xl tracking-tight">Курьеры</h1>
        <p className="mt-2 text-muted-foreground">
          Статус курьеров и текущая нагрузка (см.{" "}
          <code className="text-sm">docs/admin-platform/couriers.md</code>). Назначение курьера на
          заказ — автоматическое, при истечении буфера отмены.
        </p>

        <section className="mt-8 rounded-2xl border border-border/60 bg-card p-6">
          {!couriers || couriers.length === 0 ? (
            <div className="py-8 text-center">
              <Bike className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Курьеров пока нет.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {couriers.map((courier) => (
                <li
                  key={courier.courierId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <span className="truncate text-sm">{courier.courierId}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Доставок сейчас: {courier.activeDeliveries}</Badge>
                    <Badge variant={courier.isAvailable ? "secondary" : "outline"}>
                      {courier.isAvailable ? "Доступен" : "Недоступен"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
