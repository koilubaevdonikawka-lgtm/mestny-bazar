import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listCourierOrders } from "@/api/courier";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@/lib/order-display";
import { OrderStatus } from "@shared/contracts/order";
import { Loader2, LogIn, Package, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/courier/orders/")({
  component: CourierOrdersPage,
});

function CourierOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session?.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["courier", "orders", "list"],
    queryFn: listCourierOrders,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/courier/orders",
    });
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
          <h1 className="font-serif text-3xl tracking-tight">Доставка заказов</h1>
          <p className="mt-3 text-muted-foreground">Войдите с учётной записью курьера.</p>
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
      message.toLowerCase().includes("courier role");
    const isAuthError =
      message.toLowerCase().includes("authentication") || message.includes("Unauthorized");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">Эта страница доступна только курьерам.</p>
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

  const readyForDelivery = orders.filter(
    (order) =>
      order.status === OrderStatus.READY_FOR_DELIVERY || order.status === OrderStatus.ASSEMBLING,
  );
  const inDelivery = orders.filter(
    (order) =>
      order.status === OrderStatus.OUT_FOR_DELIVERY || order.status === OrderStatus.ARRIVED,
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-serif text-4xl tracking-tight">Доставка заказов</h1>
        <p className="mt-2 text-muted-foreground">
          Готовы к доставке: {readyForDelivery.length} · В пути: {inDelivery.length}
        </p>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">Заказов для доставки нет</h2>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to="/courier/orders/$id"
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
