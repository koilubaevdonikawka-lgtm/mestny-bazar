import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { cancelOrder, getOrder } from "@/api/orders";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@shared/lib/order-display";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import type { TranslationKey } from "@/i18n/t";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailPage,
});

const CANCEL_ERROR_KEYS: Record<string, TranslationKey> = {
  CANCELLATION_WINDOW_EXPIRED: "orders.cancelWindowExpired",
  ORDER_ALREADY_IN_PROGRESS: "orders.cancelAlreadyInProgress",
};

function formatCancelError(error: unknown, t: (key: TranslationKey) => string): string {
  if (error instanceof Error) {
    for (const [code, key] of Object.entries(CANCEL_ERROR_KEYS)) {
      if (error.message.includes(code)) return t(key);
    }
  }
  return t("orders.cancelGenericError");
}

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
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

  // Called unconditionally (rules of hooks) — empty list before the order loads.
  const itemTranslations = useTranslatedTexts(
    (order?.items ?? []).map((item) => item.productName),
    language,
  );

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: (updated) => {
      // Update immediately, in addition to invalidating — the order history
      // (this page and the list) must not wait on a refetch round trip to
      // reflect a cancellation the customer just confirmed.
      queryClient.setQueryData(["orders", id], updated);
      queryClient.invalidateQueries({ queryKey: ["orders", id] });
      queryClient.invalidateQueries({ queryKey: ["orders", "list"] });
      toast.success(t("orders.cancelledToast"));
    },
    onError: (e) => toast.error(formatCancelError(e, t)),
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
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <LogIn className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl tracking-tight">{t("orders.signInTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("orders.signInToViewOrder")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
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
    const message = error instanceof Error ? error.message : t("orders.loadOrderError");
    if (message.includes("not found") || message.includes("Order not found")) {
      throw notFound();
    }
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <p className="text-muted-foreground">{message}</p>
          <Button asChild size="lg" className="mt-6 h-12 rounded-full">
            <Link to="/orders">{t("orders.backToList")}</Link>
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
            {t("orders.title")}
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">
              {t("orders.orderNumber", { number: order.orderNumber })}
            </h1>
            <p className="mt-2 text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
            <Badge variant="outline">{formatPaymentStatus(order.paymentStatus)}</Badge>
          </div>
        </div>

        <div className="mt-6">
          <CancelOrderButton
            order={order}
            isPending={cancelMutation.isPending}
            onConfirm={() => cancelMutation.mutate()}
          />
        </div>

        <OrderTimeline order={order} />

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">{t("checkout.address")}</h2>
            <p className="mt-1">{order.addressSnapshot}</p>
            {order.deliveryEtaMinMinutes != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t("orders.etaLabel", {
                  min: order.deliveryEtaMinMinutes,
                  max: order.deliveryEtaMaxMinutes ?? "",
                })}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                {t("orders.recipientLabel")}
              </h2>
              <p className="mt-1">{order.customerName}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                {t("orders.phoneLabel")}
              </h2>
              <p className="mt-1">{order.customerPhone}</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("checkout.paymentMethod")}
            </h2>
            <p className="mt-1">
              {order.paymentMethod === "ONLINE"
                ? t("orders.paymentOnline")
                : t("orders.paymentCash")}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">{t("orders.itemsTitle")}</h2>
          <ul className="space-y-4">
            {order.items.map((item) => {
              const displayName = itemTranslations[item.productName] ?? item.productName;
              return (
                <li key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                    {item.productImageUrl && (
                      <img
                        src={item.productImageUrl}
                        alt={displayName}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                    </p>
                  </div>
                  <p className="font-semibold flex-shrink-0">
                    {formatMoney(item.lineTotal, order.currency)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("orders.subtotal")}</span>
              <span>{formatMoney(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("orders.deliveryFeeLabel")}</span>
              <span>{formatMoney(order.deliveryFee, order.currency)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-primary">
                <span>
                  {t("orders.discountLabel", {
                    couponSuffix: order.couponCode ? ` (${order.couponCode})` : "",
                  })}
                </span>
                <span>−{formatMoney(order.discountAmount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>{t("cart.total")}</span>
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
      <SiteHeader safeAreaTop hideSignInButton />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
