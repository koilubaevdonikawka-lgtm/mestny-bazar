import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listCourierOrderHistory } from "@/api/courier";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { formatMoney, formatOrderDate, formatOrderStatus } from "@shared/lib/order-display";
import { calculateCourierEarnings, summarizeCourierEarnings } from "@shared/lib/courier-earnings";
import { OrderStatus } from "@shared/contracts/order";
import { ArrowLeft, Loader2, LogIn, Package, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/courier/history")({
  component: CourierHistoryPage,
});

/**
 * Задача №143 — a single courier's realistic order volume comfortably fits
 * one generous page (listByCourier's own default is 50); this page
 * intentionally has no "load more"/pagination UI yet — earnings totals
 * below are computed only over whatever this one page returns.
 */
const HISTORY_PAGE_SIZE = 200;

function CourierHistoryPage() {
  const { isAuthenticated } = useSupabaseSession();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["courier", "history"],
    queryFn: () => listCourierOrderHistory({ pageSize: HISTORY_PAGE_SIZE }),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await signInWithGoogle();
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
          <h1 className="font-serif text-3xl tracking-tight">История и заработок</h1>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить историю";
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

  const orders = data?.items ?? [];
  const summary = summarizeCourierEarnings(orders);
  const currency = orders[0]?.currency ?? "KGS";

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/courier/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Заказы для доставки
          </Link>
        </Button>

        <h1 className="font-serif text-4xl tracking-tight">История и заработок</h1>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <EarningsCard label="Сегодня" amount={summary.today} currency={currency} />
          <EarningsCard label="Эта неделя" amount={summary.thisWeek} currency={currency} />
          <EarningsCard label="Этот месяц" amount={summary.thisMonth} currency={currency} />
        </div>

        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl">Заказов пока нет</h2>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to="/courier/orders/$id"
                  params={{ id: order.id }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  <div>
                    <p className="font-medium">Заказ №{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={order.status === OrderStatus.DELIVERED ? "secondary" : "outline"}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Доставка: {formatMoney(order.deliveryFee, order.currency)}
                    </p>
                    {order.status === OrderStatus.DELIVERED && (
                      <p className="font-semibold">
                        {formatMoney(calculateCourierEarnings(order), order.currency)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}

function EarningsCard({
  label,
  amount,
  currency,
}: {
  label: string;
  amount: number;
  currency: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 text-center">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="mt-1 font-serif text-xl">{formatMoney(amount, currency)}</p>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Задача №176 — courier has no use for cart or product search. */}
      <SiteHeader showCart={false} showSearch={false} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
