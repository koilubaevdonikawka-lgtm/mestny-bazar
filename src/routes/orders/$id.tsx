import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { getOrder } from "@/api/orders";
import { lovable } from "@/integrations/lovable";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@/lib/order-display";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { isAuthenticated } = useSupabaseSession();

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + `/orders/${id}`,
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
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">Войдите в аккаунт</h1>
          <p className="mt-3 text-muted-foreground">Чтобы просмотреть заказ, нужна авторизация.</p>
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
    const message = error instanceof Error ? error.message : "Не удалось загрузить заказ";
    if (message.includes("not found") || message.includes("Order not found")) {
      throw notFound();
    }
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <p className="text-muted-foreground">{message}</p>
          <Button asChild size="lg" className="mt-6 h-12 rounded-full">
            <Link to="/orders">К списку заказов</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!order) {
    throw notFound();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Мои заказы
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">Заказ №{order.orderNumber}</h1>
            <p className="mt-2 text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
            <Badge variant="outline">{formatPaymentStatus(order.paymentStatus)}</Badge>
          </div>
        </div>

        <OrderTimeline order={order} />

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Адрес доставки</h2>
            <p className="mt-1">{order.addressSnapshot}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Получатель</h2>
              <p className="mt-1">{order.customerName}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">Телефон</h2>
              <p className="mt-1">{order.customerPhone}</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Способ оплаты</h2>
            <p className="mt-1">{order.paymentMethod === "ONLINE" ? "Онлайн" : "Наличными"}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">Состав заказа</h2>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                  {item.productImageUrl && (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                  </p>
                </div>
                <p className="font-semibold flex-shrink-0">
                  {formatMoney(item.lineTotal, order.currency)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Подытог</span>
              <span>{formatMoney(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Доставка</span>
              <span>{formatMoney(order.deliveryFee, order.currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>Итого</span>
              <span>{formatMoney(order.total, order.currency)}</span>
            </div>
          </div>
        </section>
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
