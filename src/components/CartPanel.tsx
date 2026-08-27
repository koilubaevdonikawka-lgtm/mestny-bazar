import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  AlertTriangle,
  Loader2,
  Truck,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { formatDisplayPrice } from "@/lib/formatPrice";
import { calculateDeliveryFee } from "@/api/delivery-pricing";
import { listDeliveryZones } from "@/api/delivery-zone";
import { cancelUnpaidOnlineOrder, getOrderStatus, retryPayment } from "@/api/orders";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import { RetryPaymentButton } from "@/components/RetryPaymentButton";
import { CancelUnpaidOnlineOrderButton } from "@/components/CancelUnpaidOnlineOrderButton";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useCheckoutReadiness } from "@/hooks/useCheckoutReadiness";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import type { CartLineStatus } from "@shared/contracts/cart";
import { OrderStatus } from "@shared/contracts/order";
import { formatOrderStatus } from "@shared/lib/order-display";

/**
 * "Last placed order" — a cart-local concept, deliberately separate from
 * checkoutStore (that store is the in-progress checkout draft and gets
 * wiped by reset() on every new checkout; this must survive that). Plain
 * localStorage rather than a new Zustand store field.
 */
const LAST_ORDER_ID_STORAGE_KEY = "platform-last-order-id";

const TERMINAL_ORDER_STATUSES: ReadonlySet<OrderStatus> = new Set([
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
]);

export interface CartPanelProps {
  /**
   * Whether this panel is the currently active/visible surface — gates the
   * cart-validation/order-status/delivery-fee queries the exact same way
   * CartDrawer's own Sheet open-state used to. A standalone page mounting
   * this directly is always active; CartDrawer passes its Sheet's own open
   * state so these queries pause while the sheet is closed.
   */
  active: boolean;
  /**
   * Called right before any internal navigation away (tapping a product,
   * the empty-state/order-status "back to catalog" links) — CartDrawer
   * uses this to close its Sheet first. A standalone page has nothing to
   * close, so it can omit this.
   */
  onNavigate?: () => void;
  /**
   * Called immediately after an order is successfully created, before the
   * payment-redirect-or-order-success navigation happens — same reason as
   * onNavigate above.
   */
  onOrderPlaced?: () => void;
}

/**
 * The actual cart experience (items/quantities/warnings, delivery fee,
 * inline checkout form, last-order status) — no Sheet/Dialog chrome of its
 * own, so it drops into CartDrawer's SheetContent and the standalone /cart
 * page identically (Этап "нижняя панель вкладок", шаг 1). All business
 * logic (cart/checkout stores, delivery pricing, order creation) is
 * unchanged from what CartDrawer used to own directly — only extracted.
 */
export function CartPanel({ active, onNavigate, onOrderPlaced }: CartPanelProps) {
  const { t, language } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const readiness = useCheckoutReadiness();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const VALIDATION_MESSAGE: Record<Exclude<CartLineStatus, "ok">, string> = useMemo(
    () => ({
      price_changed: t("cart.priceChangedWarning"),
      out_of_stock: t("cart.outOfStockWarning"),
      not_found: t("cart.notAvailableWarning"),
    }),
    [t],
  );
  const [lineWarnings, setLineWarnings] = useState<Record<string, string>>({});
  // Read only on the client, after mount — never during the initial
  // render — so this never disagrees with the server-rendered/hydration
  // pass (localStorage doesn't exist server-side).
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [orderStatusDismissed, setOrderStatusDismissed] = useState(false);
  useEffect(() => {
    setLastOrderId(localStorage.getItem(LAST_ORDER_ID_STORAGE_KEY));
  }, []);
  const { items, isLoading, removeItem, validateCart, clearCart } = useCartStore();
  const { paymentMethod, setPaymentMethod } = useCheckoutStore();
  // Задача №182 — the default saved Address (with its zone) is the single
  // source of truth for delivery now; nothing here is collected inline
  // anymore, only displayed (see the read-only "deliver to" summary below).
  const zoneId = readiness.defaultAddress?.zoneId ?? null;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const itemTranslations = useTranslatedTexts(
    items.map((i) => i.product.node.title),
    language,
  );

  // Same query as the home page's own address dialog (Промпт №1) — reused
  // as-is so both surfaces list the exact same zones.
  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
    enabled: active,
  });

  // Server-computed only (CD-01) — never a client-side estimate, including
  // the order's weight: items/quantities are sent so the server can look up
  // each product's real weightKg itself (weight-based delivery formula,
  // docs/delivery/delivery-pricing.md) rather than trusting a client-summed
  // number. queryKey includes item identities/quantities so the preview
  // refetches when the cart composition changes, not just its total price.
  const deliveryQuery = useQuery({
    queryKey: [
      "delivery",
      "fee",
      zoneId,
      totalPrice,
      items.map((item) => `${item.product.node.handle}:${item.quantity}`).join(","),
    ],
    queryFn: () =>
      calculateDeliveryFee({
        zoneId: zoneId!,
        subtotal: totalPrice,
        items: items.map((item) => ({
          productSlug: item.product.node.handle,
          quantity: item.quantity,
        })),
      }),
    enabled: active && !!zoneId && totalItems > 0,
    retry: false,
  });

  useEffect(() => {
    if (!active) return;
    setLineWarnings({});
    // A visually-dismissed non-terminal order status must resurface the
    // next time this panel becomes active again — only a terminal status's
    // dismiss clears lastOrderId itself (handleDismissOrderStatus below).
    setOrderStatusDismissed(false);
    void validateCart().then((result) => {
      if (!result) return;
      const warnings: Record<string, string> = {};
      for (const line of result.lines) {
        if (line.status === "ok") continue;
        const key = line.productSlug ?? line.productId ?? "";
        warnings[key] = VALIDATION_MESSAGE[line.status];
      }
      setLineWarnings(warnings);
    });
  }, [active, validateCart, VALIDATION_MESSAGE]);

  // Only fetched when the cart is actually empty and a last-order id is on
  // hand — an in-progress cart (items.length > 0) always shows the normal
  // items/checkout view instead, never this, so adding a new item while a
  // previous order's status is showing switches back to checkout on its own.
  const orderStatusQuery = useQuery({
    queryKey: ["orders", "status", lastOrderId],
    queryFn: () => getOrderStatus(lastOrderId!),
    enabled: active && items.length === 0 && !!lastOrderId,
    retry: false,
  });

  // Stale/deleted orderId (or any other fetch failure) — fall back to the
  // plain empty state instead of getting stuck retrying a dead reference.
  useEffect(() => {
    if (!orderStatusQuery.isError) return;
    localStorage.removeItem(LAST_ORDER_ID_STORAGE_KEY);
    setLastOrderId(null);
  }, [orderStatusQuery.isError]);

  const handleDismissOrderStatus = () => {
    const status = orderStatusQuery.data?.status;
    if (status && TERMINAL_ORDER_STATUSES.has(status)) {
      // Terminal — this order is done; forget it for good.
      localStorage.removeItem(LAST_ORDER_ID_STORAGE_KEY);
      setLastOrderId(null);
    }
    // Non-terminal — only a visual dismiss for this viewing; the active
    // effect above resets this the next time the panel becomes active again.
    setOrderStatusDismissed(true);
  };

  // Задача №174 — same "returned without paying" actions order-success.tsx
  // offers (Задача №172), reused as-is here since the last-placed-order view
  // in the cart is the exact same real-world situation (ONLINE, unpaid,
  // still CREATED), just reached from a different screen.
  const retryPaymentMutation = useMutation({
    mutationFn: () => retryPayment(lastOrderId as string),
    onSuccess: (result) => {
      if (!result.paymentUrl) {
        toast.error(t("orders.retryPaymentError"));
        return;
      }
      window.location.href = result.paymentUrl;
    },
    onError: () => toast.error(t("orders.retryPaymentError")),
  });

  const cancelUnpaidOnlineOrderMutation = useMutation({
    mutationFn: () => cancelUnpaidOnlineOrder(lastOrderId as string),
    onSuccess: (updated) => {
      queryClient.setQueryData(["orders", "status", lastOrderId], updated);
      toast.success(t("orderSuccess.cancelledToast"));
    },
    onError: () => toast.error(t("orderSuccess.cancelError")),
  });

  const { submitOrder, isSubmitting } = useCreateOrder();

  const handleCheckout = async () => {
    // Задача №182 — guest checkout removed entirely, and the cart no longer
    // collects address/phone/name itself; both gates redirect to where the
    // missing piece actually gets filled in, instead of failing at the API.
    if (readiness.isAuthenticated !== true) {
      await handleSignIn();
      return;
    }
    if (readiness.isReady === null) return;
    if (!readiness.isReady) {
      toast.error(t("profile.completeProfileToOrderDescription"));
      onNavigate?.();
      await navigate({ to: "/profile" });
      return;
    }

    const orderItems = items.map((item) => ({
      productSlug: item.product.node.handle,
      quantity: item.quantity,
      snapshot: {
        name: item.product.node.title,
        price: parseFloat(item.price.amount),
        currency: item.price.currencyCode,
        imageUrl: item.product.node.images?.edges?.[0]?.node?.url ?? null,
      },
    }));
    await submitOrder(orderItems, async (response) => {
      localStorage.setItem(LAST_ORDER_ID_STORAGE_KEY, response.order.id);
      setLastOrderId(response.order.id);
      setOrderStatusDismissed(false);
      await clearCart();
      useCheckoutStore.getState().reset();
      onOrderPlaced?.();
    });
  };

  const checkoutBusy = isLoading || isSubmitting;
  const showOrderStatus = items.length === 0 && !!lastOrderId && !orderStatusDismissed;

  // Задача №174 — ONLINE order, still unpaid, still CREATED: the cart's
  // "returned without completing payment" case, same scenario
  // order-success.tsx handles (Задача №172) — just reached by closing the
  // cart and reopening it instead of returning from Finik directly. Gated on
  // CREATED specifically (not just "not paid") so this reverts back to the
  // plain Close/Go-to-catalog buttons the moment the order leaves CREATED —
  // including right after this same cancel action flips it to CANCELLED.
  const lastOrder = orderStatusQuery.data;
  const showUnpaidOnlineActions =
    lastOrder?.status === OrderStatus.CREATED &&
    lastOrder.paymentMethod === "ONLINE" &&
    lastOrder.paymentStatus !== "paid" &&
    lastOrder.paymentStatus !== "refunded";

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  // Beautiful, actionable empty state instead of just an icon + caption:
  // heading, description, and a direct way back into the catalog.
  const emptyCartState = (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
        <ShoppingCart className="h-9 w-9 text-primary" />
      </div>
      <div>
        <h3 className="font-serif text-xl">{t("cart.empty")}</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("cart.emptyDescription")}</p>
      </div>
      <Button asChild size="lg" className="h-12 rounded-full px-8 gap-2">
        <Link to="/" onClick={() => onNavigate?.()}>
          <ArrowLeft className="h-4 w-4" /> {t("cart.emptyCta")}
        </Link>
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 pt-4 min-h-0">
      {items.length === 0 ? (
        showOrderStatus ? (
          orderStatusQuery.isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : lastOrder ? (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("orders.orderNumber", { number: lastOrder.orderNumber })}
              </p>
              {/* Задача №173 — only the order's current, actually-reached
                  status, shown once, in green. No step chain/ladder (past or
                  future steps) at all — OrderTimeline's full sequence stays
                  reserved for the customer's own order detail page
                  (/orders/$id), not the cart. Задача №174 — CREATED is
                  disambiguated by payment method (its own text, not combined
                  with any other status). */}
              <div className="mt-3 flex flex-col items-center gap-2">
                <Badge variant="default" data-testid="cart-order-status-badge">
                  {lastOrder.status === OrderStatus.CREATED
                    ? lastOrder.paymentMethod === "ONLINE"
                      ? t("cart.orderStatusCreatedOnline")
                      : t("cart.orderStatusCreatedCash")
                    : formatOrderStatus(lastOrder.status)}
                </Badge>
                {showUnpaidOnlineActions && (
                  <Badge variant="destructive" data-testid="cart-unpaid-status-badge">
                    {t("orderSuccess.unpaidStatusBadge")}
                  </Badge>
                )}
              </div>
              {showUnpaidOnlineActions ? (
                isAuthenticated === true ? (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    <RetryPaymentButton
                      order={lastOrder}
                      isPending={retryPaymentMutation.isPending}
                      onRetry={() => retryPaymentMutation.mutate()}
                    />
                    <CancelUnpaidOnlineOrderButton
                      order={lastOrder}
                      isPending={cancelUnpaidOnlineOrderMutation.isPending}
                      onConfirm={() => cancelUnpaidOnlineOrderMutation.mutate()}
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center gap-3">
                    <p className="text-center text-sm text-muted-foreground">
                      {t("orderSuccess.retryPaymentSignInPrompt")}
                    </p>
                    <Button variant="outline" onClick={() => void handleSignIn()}>
                      {t("common.signIn")}
                    </Button>
                  </div>
                )
              ) : (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleDismissOrderStatus}
                  >
                    {t("common.close")}
                  </Button>
                  <Button asChild size="lg" className="h-12 rounded-full px-8 gap-2">
                    <Link to="/" onClick={() => onNavigate?.()}>
                      <ArrowLeft className="h-4 w-4" /> {t("cart.emptyCta")}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            emptyCartState
          )
        ) : (
          emptyCartState
        )
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            <div className="space-y-3">
              {items.map((item) => {
                const warning = lineWarnings[item.product.node.handle];
                const displayTitle =
                  itemTranslations[item.product.node.title] ?? item.product.node.title;
                const lineTotal = parseFloat(item.price.amount) * item.quantity;
                return (
                  <div key={item.variantId} className="flex gap-3 rounded-2xl bg-secondary/40 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        {/* 2-line clamp instead of a hard single-line
                            truncate, so a long product name stays legible
                            instead of being cut down to a few characters;
                            still bounded so one item can't grow the row
                            unpredictably. */}
                        {item.product.node.handle ? (
                          <Link
                            to="/product/$handle"
                            params={{ handle: item.product.node.handle }}
                            onClick={() => onNavigate?.()}
                            className="line-clamp-2 min-w-0 text-sm font-medium hover:underline"
                          >
                            {displayTitle}
                          </Link>
                        ) : (
                          <h4 className="line-clamp-2 min-w-0 text-sm font-medium">
                            {displayTitle}
                          </h4>
                        )}
                        {/* Direct removal, no confirmation dialog — a
                            shortcut on top of the stepper's own
                            decrement-to-zero removal below. */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 shrink-0 -mr-2 -mt-1 text-muted-foreground"
                          aria-label={t("cart.removeItemAriaLabel")}
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {item.selectedOptions.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.selectedOptions.map((o) => o.value).join(" • ")}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDisplayPrice(parseFloat(item.price.amount))}{" "}
                        {t("product.currencyLabel")}
                      </p>
                      {warning && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                          {warning}
                        </p>
                      )}
                      {/* Quantity control lives directly on the cart row —
                          same shared component/store as the catalog and
                          product page, so all three always agree on the
                          quantity. Line total sits opposite it, always the
                          up-to-date price × qty (recomputed every render). */}
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <CartQuantityControl product={item.product} size="lg" />
                        <span className="shrink-0 font-serif text-base font-semibold whitespace-nowrap">
                          {formatDisplayPrice(lineTotal)} {t("product.currencyLabel")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Задача №182 — deliver-to summary, read-only: address/zone/
                phone/name now live on the profile (AddressesPanel's default
                address + /profile's name/phone form) and are resolved
                server-side from there at checkout time. Nothing here is
                collected inline anymore, only shown; a signed-out visitor
                gets a way to fix it, not an inline form.
                Задача №183 — the incomplete-profile case no longer shows an
                explanatory card here: the gate itself (handleCheckout above)
                already redirects to /profile with no re-entry needed, so a
                second, passive "please complete your profile" card while
                just browsing the cart was redundant — this section simply
                renders nothing until there's something real to show. */}
            {readiness.isAuthenticated !== true ? (
              <section className="mt-4 space-y-2">
                <Label className="text-sm font-medium">{t("checkout.address")}</Label>
                <div className="rounded-xl bg-secondary/40 p-4 text-sm space-y-2">
                  <p className="text-muted-foreground">{t("profile.signInToOrderDescription")}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => void handleSignIn()}
                  >
                    {t("common.signIn")}
                  </Button>
                </div>
              </section>
            ) : readiness.isReady === null ? (
              <section className="mt-4 space-y-2">
                <Label className="text-sm font-medium">{t("checkout.address")}</Label>
                <div className="flex justify-center py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </section>
            ) : readiness.isReady ? (
              <section className="mt-4 space-y-2">
                <Label className="text-sm font-medium">{t("checkout.address")}</Label>
                <div className="rounded-xl bg-secondary/40 p-4 text-sm space-y-1">
                  <p className="font-medium">{readiness.profile?.fullName}</p>
                  <p className="text-muted-foreground">{readiness.profile?.phone}</p>
                  <p className="text-muted-foreground">{readiness.defaultAddress?.fullAddress}</p>
                  {readiness.defaultAddress?.zoneId && (
                    <p className="text-muted-foreground">
                      {t("addresses.zoneDisplay", {
                        zoneName:
                          deliveryZones?.find((z) => z.id === readiness.defaultAddress?.zoneId)
                            ?.name ?? "—",
                      })}
                    </p>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => onNavigate?.()}
                    className="text-xs text-primary underline"
                  >
                    {t("common.edit")}
                  </Link>
                </div>
              </section>
            ) : null}

            <section className="mt-4 space-y-2">
              <Label className="text-sm font-medium">{t("checkout.paymentMethod")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  className="h-11 rounded-xl text-sm"
                  onClick={() => {
                    setPaymentMethod("CASH");
                    toast.success(t("home.cashPaymentSelectedToast"));
                  }}
                >
                  {t("home.payCashButton")}
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "ONLINE" ? "default" : "outline"}
                  className="h-11 rounded-xl text-sm"
                  onClick={() => {
                    setPaymentMethod("ONLINE");
                    toast.info(t("home.onlinePaymentSelectedToast"));
                  }}
                >
                  <CreditCard className="h-4 w-4" /> {t("home.payOnlineButton")}
                </Button>
              </div>
            </section>
          </div>
          {/* Pinned bottom panel (inside a bounded-height ancestor, e.g.
              CartDrawer's SheetContent) — total + checkout button always
              stay in reach without scrolling, recomputed on every render
              from live state. Inside an unbounded ancestor (a plain page),
              this degrades gracefully to normal in-flow layout. */}
          <div className="flex-shrink-0 space-y-3 pt-4 pb-safe border-t bg-background">
            {zoneId
              ? deliveryQuery.data && (
                  <div className="flex items-start gap-2 rounded-xl bg-secondary/40 px-4 py-3 text-sm">
                    <Truck className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                      <p>
                        {t("cart.deliveryLabel")}:{" "}
                        <strong>
                          {deliveryQuery.data.isFree
                            ? t("cart.free")
                            : `${formatDisplayPrice(deliveryQuery.data.fee)} ${t("product.currencyLabel")}`}
                        </strong>
                      </p>
                      {deliveryQuery.data.eta.minMinutes != null && (
                        <p className="text-muted-foreground">
                          {t("cart.etaLabel", {
                            min: deliveryQuery.data.eta.minMinutes,
                            max: deliveryQuery.data.eta.maxMinutes ?? "",
                          })}
                        </p>
                      )}
                      {!deliveryQuery.data.isFree && deliveryQuery.data.freeFrom != null && (
                        <p className="text-muted-foreground">
                          {t("cart.freeDeliveryFromLabel", {
                            amount: formatDisplayPrice(deliveryQuery.data.freeFrom),
                            remaining: formatDisplayPrice(deliveryQuery.data.freeFrom - totalPrice),
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                )
              : null}
            <div className="flex justify-between items-center">
              <span className="text-lg">{t("cart.total")}</span>
              <span className="text-2xl font-serif font-semibold">
                {formatDisplayPrice(totalPrice)} {t("product.currencyLabel")}
              </span>
            </div>
            {/* The single most visually prominent control in the whole
                panel: tallest, boldest text, shadow — so checkout
                unmistakably reads as the primary action. */}
            <Button
              onClick={handleCheckout}
              className="w-full h-14 rounded-full text-lg font-semibold shadow-lg"
              disabled={
                items.length === 0 ||
                checkoutBusy ||
                (readiness.isAuthenticated === true && readiness.isReady === null)
              }
            >
              {checkoutBusy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t("cart.checkout")}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
