import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  acceptCourierOrder,
  completeCourierDelivery,
  getCourierOrder,
  markCourierArrival,
  startCourierDelivery,
} from "@/api/courier";
import { lovable } from "@/integrations/lovable";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@/lib/order-display";
import { OrderStatus } from "@shared/contracts/order";
import { ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/courier/orders/$id")({
  component: CourierOrderDetailPage,
});

function CourierOrderDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSupabaseSession();
  const [accepted, setAccepted] = useState(false);
  const [arrived, setArrived] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courier", "orders", id],
    queryFn: () => getCourierOrder(id),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["courier", "orders", id] });
    queryClient.invalidateQueries({ queryKey: ["courier", "orders", "list"] });
  };

  const acceptMutation = useMutation({
    mutationFn: () => acceptCourierOrder(id),
    onSuccess: () => {
      setAccepted(true);
      toast.success("Заказ принят");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось принять заказ"),
  });

  const startMutation = useMutation({
    mutationFn: () => startCourierDelivery(id),
    onSuccess: () => {
      invalidate();
      toast.success("Доставка начата");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось начать доставку"),
  });

  const arriveMutation = useMutation({
    mutationFn: () => markCourierArrival(id),
    onSuccess: () => {
      setArrived(true);
      invalidate();
      toast.success("Прибытие отмечено");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось отметить прибытие"),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeCourierDelivery(id),
    onSuccess: () => {
      invalidate();
      toast.success("Доставка завершена");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Не удалось завершить доставку"),
  });

  const handleSignIn = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + `/courier/orders/${id}`,
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
          <p className="mt-3 text-muted-foreground">Нужна авторизация курьера.</p>
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
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("courier role");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24 px-6">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">Доступ запрещён</h1>
              <p className="mt-3 text-muted-foreground">Эта страница доступна только курьерам.</p>
            </>
          ) : (
            <p className="text-muted-foreground">{message}</p>
          )}
          <Button asChild size="lg" className="mt-6 h-12 rounded-full">
            <Link to="/courier/orders">К списку заказов</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!order) {
    throw notFound();
  }

  const isReadyForDelivery =
    order.status === OrderStatus.READY_FOR_DELIVERY || order.status === OrderStatus.ASSEMBLING;
  const canAccept = isReadyForDelivery && !accepted;
  const canStartDelivery = isReadyForDelivery && accepted;
  const canMarkArrival = order.status === OrderStatus.OUT_FOR_DELIVERY && !arrived;
  const canCompleteDelivery =
    order.status === OrderStatus.ARRIVED ||
    (order.status === OrderStatus.OUT_FOR_DELIVERY && arrived);
  const isBusy =
    acceptMutation.isPending ||
    startMutation.isPending ||
    arriveMutation.isPending ||
    completeMutation.isPending;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/courier/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Заказы для доставки
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

        <div className="mt-6 flex flex-wrap gap-3">
          {canAccept && (
            <Button disabled={isBusy} onClick={() => acceptMutation.mutate()}>
              {acceptMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Принять заказ"
              )}
            </Button>
          )}
          {canStartDelivery && (
            <Button disabled={isBusy} onClick={() => startMutation.mutate()}>
              {startMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Начать доставку"
              )}
            </Button>
          )}
          {canMarkArrival && (
            <Button disabled={isBusy} onClick={() => arriveMutation.mutate()}>
              {arriveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Отметить прибытие"
              )}
            </Button>
          )}
          {canCompleteDelivery && (
            <Button disabled={isBusy} onClick={() => completeMutation.mutate()}>
              {completeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Завершить доставку"
              )}
            </Button>
          )}
        </div>

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
