import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { getSalesAnalytics } from "@/api/analytics";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { ArrowLeft, BarChart3, Loader2, LogIn, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin/analytics/")({
  component: AdminAnalyticsPage,
});

function formatMoney(value: number): string {
  return `${value.toLocaleString("ru-RU")} сом`;
}

function AdminAnalyticsPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: analytics,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "analytics", "sales"],
    queryFn: () => getSalesAnalytics(),
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
          <h1 className="font-serif text-3xl tracking-tight">Аналитика</h1>
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

  if (isError || !analytics) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить аналитику";
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

        <h1 className="font-serif text-4xl tracking-tight">Аналитика продаж</h1>
        <p className="mt-2 text-muted-foreground">
          Динамика продаж за последние 30 дней (см.{" "}
          <code className="text-sm">docs/admin-platform/analytics.md</code>). Покупатели, курьеры и
          экспорт — будущее расширение.
        </p>

        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="text-sm text-muted-foreground">Заказы</p>
            <p className="mt-2 font-serif text-3xl">{analytics.orderCount}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="text-sm text-muted-foreground">Выручка</p>
            <p className="mt-2 font-serif text-3xl">{formatMoney(analytics.revenue)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <p className="text-sm text-muted-foreground">Средний чек</p>
            <p className="mt-2 font-serif text-3xl">{formatMoney(analytics.averageOrderValue)}</p>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Топ товаров</h2>
          {analytics.topProducts.length === 0 ? (
            <div className="py-8 text-center">
              <BarChart3 className="h-6 w-6 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">За этот период продаж не было.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {analytics.topProducts.map((product) => (
                <li
                  key={product.productId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">{product.quantitySold} шт.</p>
                  </div>
                  <p className="font-serif text-lg text-primary">{formatMoney(product.revenue)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
