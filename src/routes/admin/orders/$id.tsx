import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CancellationWindowBadge } from "@/components/admin/CancellationWindowBadge";
import { cancelAdminOrder, confirmAdminOrder, getAdminOrder } from "@/api/admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  formatPaymentStatus,
} from "@shared/lib/order-display";
import { OrderStatus } from "@shared/contracts/order";
import { ArrowLeft, Loader2, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders/$id")({
  component: AdminOrderDetailPage,
});

function AdminOrderDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSupabaseSession();
  const { t } = useTranslation();

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: () => getAdminOrder(id),
    enabled: isAuthenticated === true,
    retry: false,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => confirmAdminOrder(id),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.orders.confirmedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("admin.orders.confirmError")),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelAdminOrder(id),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.orders.cancelledToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("admin.orders.cancelError")),
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
          <h1 className="font-serif text-3xl tracking-tight">
            {t("admin.orders.signInRequiredTitle")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("admin.orders.signInRequiredMessage")}</p>
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
    const message = error instanceof Error ? error.message : t("admin.orders.loadDetailError");
    if (message.includes("not found") || message.includes("Order not found")) {
      throw notFound();
    }
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");

    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24 px-6">
          {isForbidden ? (
            <>
              <ShieldAlert className="h-10 w-10 text-primary mx-auto mb-4" />
              <h1 className="font-serif text-3xl tracking-tight">
                {t("admin.common.accessDeniedTitle")}
              </h1>
              <p className="mt-3 text-muted-foreground">{t("admin.common.adminOnlyMessage")}</p>
            </>
          ) : (
            <p className="text-muted-foreground">{message}</p>
          )}
          <Button asChild size="lg" className="mt-6 h-12 rounded-full">
            <Link to="/admin/orders">{t("admin.orders.backToListLink")}</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!order) {
    throw notFound();
  }

  const canConfirm = order.status === OrderStatus.CREATED || order.status === OrderStatus.PAID;
  const canCancel =
    order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED;
  const isBusy = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Button asChild variant="ghost" className="mb-6 -ml-2 rounded-full">
          <Link to="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("admin.orders.allOrdersLink")}
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">
              {t("admin.orders.orderNumberPrefix", { number: String(order.orderNumber) })}
            </h1>
            <p className="mt-2 text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
            <Badge variant="outline">{formatPaymentStatus(order.paymentStatus)}</Badge>
            <CancellationWindowBadge order={order} />
          </div>
        </div>

        {(canConfirm || canCancel) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {canConfirm && (
              <Button disabled={isBusy} onClick={() => confirmMutation.mutate()}>
                {confirmMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("admin.orders.confirmButton")
                )}
              </Button>
            )}
            {canCancel && (
              <Button variant="outline" disabled={isBusy} onClick={() => cancelMutation.mutate()}>
                {cancelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("admin.orders.cancelButton")
                )}
              </Button>
            )}
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("admin.orders.deliveryAddressLabel")}
            </h2>
            <p className="mt-1">{order.addressSnapshot}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                {t("admin.orders.recipientLabel")}
              </h2>
              <p className="mt-1">{order.customerName}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                {t("admin.orders.phoneLabel")}
              </h2>
              <p className="mt-1">{order.customerPhone}</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("admin.orders.paymentMethodLabel")}
            </h2>
            <p className="mt-1">
              {order.paymentMethod === "ONLINE"
                ? t("admin.orders.paymentOnline")
                : t("admin.orders.paymentCash")}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <h2 className="font-serif text-2xl mb-4">{t("admin.orders.itemsHeading")}</h2>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                  {item.productImageUrl && (
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      loading="lazy"
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
              <span className="text-muted-foreground">{t("admin.orders.subtotalLabel")}</span>
              <span>{formatMoney(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("admin.orders.deliveryLabel")}</span>
              <span>{formatMoney(order.deliveryFee, order.currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2">
              <span>{t("admin.orders.totalLabel")}</span>
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
      <SiteHeader showSearch={false} showCart={false} showLanguageSwitcher />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
