import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelAdminOrder, confirmAdminOrder, getAdminOrder } from "@/api/admin";
import { signInWithGoogle } from "@/lib/auth";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { useTranslation } from "@/i18n/LanguageProvider";
import {
  formatMoney,
  formatOrderDate,
  formatOrderStatus,
  orderRequiresRefund,
} from "@shared/lib/order-display";
import { OrderStatus } from "@shared/contracts/order";
import { Loader2, LogIn, ShieldAlert } from "lucide-react";
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
    // Задача №130 — an admin watching this exact order (e.g. right after a
    // customer starts an online payment) sees the paid status land on its
    // own. 5s: tighter than the list page since only one record is fetched
    // and this is the page where "did it just get paid" matters most. A
    // background refetch never re-triggers the `isLoading` full-page
    // spinner below (only the very first, uncached fetch does), so this
    // can't interrupt an in-flight confirm/cancel mutation's own toast.
    // Paused while the tab is in the background.
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
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
    const message = error instanceof Error ? error.message : t("admin.orders.loadDetailError");
    if (message.includes("not found") || message.includes("Order not found")) {
      throw notFound();
    }
    const isForbidden =
      message.toLowerCase().includes("access denied") ||
      message.toLowerCase().includes("admin role");

    return (
      <AdminLayout>
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
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    throw notFound();
  }

  const canConfirm = order.status === OrderStatus.CREATED || order.status === OrderStatus.PAID;
  // Задача №169 — confirming an ONLINE order before its payment lands would
  // strand that payment forever (order #121, diagnosed in Задача №167):
  // once CONFIRMED, the order can never transition back to PAID. Server-side
  // enforced by AdminConfirmOrderRule; this just keeps the button visible
  // (so it's obvious confirming is the next step) but disabled, with a hint,
  // instead of a raw error only after the click.
  const confirmBlockedByPayment =
    order.paymentMethod === "ONLINE" && order.paymentStatus !== "paid";
  const canCancel =
    order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED;
  const isBusy = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl tracking-tight">
              {t("admin.orders.orderNumberPrefix", { number: String(order.orderNumber) })}
            </h1>
            <p className="mt-2 text-muted-foreground">{formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{formatOrderStatus(order.status)}</Badge>
            <Badge variant="outline">
              {order.paymentMethod === "ONLINE"
                ? t("admin.orders.paymentOnlineBadge")
                : t("admin.orders.paymentCashBadge")}
            </Badge>
            {orderRequiresRefund(order) && (
              <Badge variant="destructive">{t("admin.orders.requiresRefundBadge")}</Badge>
            )}
          </div>
        </div>

        {canConfirm && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              disabled={isBusy || confirmBlockedByPayment}
              onClick={() => confirmMutation.mutate()}
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.orders.confirmButton")
              )}
            </Button>
            {confirmBlockedByPayment && (
              <p className="text-sm text-muted-foreground">
                {t("admin.orders.confirmBlockedByPaymentHint")}
              </p>
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

        {canCancel && (
          // Задача №141 — cancel is kept available but visually demoted to
          // the very bottom of the page, separated from the frequently-used
          // confirm action above, so it doesn't compete for attention.
          <div className="mt-10 pt-6 border-t border-border/60 flex justify-end">
            {order.paymentStatus === "paid" ? (
              // Задача №140 — an already-paid order has no automatic refund
              // path (Задача №137) — cancelling it silently would leave the
              // admin unaware the customer's money is still with the
              // merchant. Requires one explicit extra confirmation step;
              // unpaid orders keep the plain one-click cancel below.
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("admin.orders.cancelButton")
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("admin.orders.cancelPaidWarningTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("admin.orders.cancelPaidWarningDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("admin.orders.cancelPaidWarningDeny")}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelMutation.mutate()}>
                      {t("admin.orders.cancelPaidWarningConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={isBusy}
                onClick={() => cancelMutation.mutate()}
                className="text-muted-foreground hover:text-destructive"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("admin.orders.cancelButton")
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
