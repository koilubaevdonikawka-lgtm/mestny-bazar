import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listWarehouseOrders } from "@/api/warehouse";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@shared/lib/order-display";
import { OrderStatus } from "@shared/contracts/order";
import { Loader2, LogIn, Package, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/warehouse/orders/")({
  component: WarehouseOrdersPage,
});

function WarehouseOrdersPage() {
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["warehouse", "orders", "list"],
    queryFn: listWarehouseOrders,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await signInWithGoogle(window.location.origin + "/warehouse/orders");
  };

  if (isAuthenticated === null) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">Сборка заказов</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью склада.</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            Войти
          </Button>
        </div>
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить заказы";
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("warehouse role");
    const isAuthError =
      message.toLowerCase().includes("authentication") || message.includes("Unauthorized");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">
                Эта страница доступна только сотрудникам склада.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{message}</p>
              {isAuthError ? (
                <Button
                  size="lg"
                  className="mt-6 h-12 rounded-full"
                  onClick={() => void handleSignIn()}
                >
                  Войти снова
                </Button>
              ) : (
                <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void refetch()}>
                  Повторить
                </Button>
              )}
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const pendingAssembly = orders.filter(
    (order) => order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.PAID,
  );
  const inAssembly = orders.filter((order) => order.status === OrderStatus.ASSEMBLING);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">Сборка заказов</h1>
        <p className="mt-2 text-muted-foreground">
          Ожидают сборки: {pendingAssembly.length} · В работе: {inAssembly.length}
        </p>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">Заказов для сборки нет</h2>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to="/warehouse/orders/$id"
                  params={{ id: order.id }}
                  className="block rounded-2xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-xl">Заказ №{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatOrderDate(order.createdAt)} · {order.customerName}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
                      <Badge variant="outline">{formatPaymentStatus(order.paymentStatus)}</Badge>
                    </div>
                  </div>
                  <p className="mt-4 font-semibold text-lg">
                    {formatMoney(order.total, order.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.items.length} {order.items.length === 1 ? "товар" : "товаров"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
