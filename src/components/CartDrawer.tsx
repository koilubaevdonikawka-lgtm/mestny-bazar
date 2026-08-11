import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { createOrder } from "@/api/orders";
import { calculateDeliveryFee } from "@/api/delivery-pricing";
import { listDeliveryZones } from "@/api/delivery-zone";
import { supabase } from "@/integrations/supabase/client";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { useCloseOnBackButton } from "@/hooks/useCloseOnBackButton";
import type { CartLineStatus } from "@shared/contracts/cart";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const VALIDATION_MESSAGE: Record<Exclude<CartLineStatus, "ok">, string> = useMemo(
    () => ({
      price_changed: t("cart.priceChangedWarning"),
      out_of_stock: t("cart.outOfStockWarning"),
      not_found: t("cart.notAvailableWarning"),
    }),
    [t],
  );
  const [isOpen, setIsOpen] = useState(false);
  // Этап №7 — Android/browser hardware Back closes the cart first instead
  // of skipping over it and navigating the page underneath away.
  useCloseOnBackButton(isOpen, setIsOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lineWarnings, setLineWarnings] = useState<Record<string, string>>({});
  const { items, isLoading, removeItem, validateCart, clearCart } = useCartStore();
  const {
    address,
    zoneId,
    paymentMethod,
    customerPhone,
    customerName,
    setAddress,
    setZoneId,
    setPaymentMethod,
    setCustomerPhone,
    setCustomerName,
  } = useCheckoutStore();
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
    enabled: isOpen,
  });

  // Server-computed only (CD-01) — never a client-side estimate. docs/delivery/delivery-pricing.md.
  const deliveryQuery = useQuery({
    queryKey: ["delivery", "fee", zoneId, totalPrice],
    queryFn: () => calculateDeliveryFee({ zoneId: zoneId!, subtotal: totalPrice }),
    enabled: isOpen && !!zoneId && totalItems > 0,
    retry: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    setLineWarnings({});
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
  }, [isOpen, validateCart, VALIDATION_MESSAGE]);

  const resolveCustomerName = async (): Promise<string> => {
    if (customerName.trim().length >= 2) return customerName.trim();
    const { data } = await supabase.auth.getUser();
    const metaName =
      data.user?.user_metadata?.full_name ??
      data.user?.user_metadata?.name ??
      data.user?.email?.split("@")[0];
    if (metaName && String(metaName).trim().length >= 2) {
      const name = String(metaName).trim();
      setCustomerName(name);
      return name;
    }
    return t("cart.defaultCustomerName");
  };

  const handleCheckout = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session?.user;
    const hasManualAddress = address.trim().length >= 5;

    if (!isAuthenticated && !hasManualAddress) {
      toast.error(t("cart.missingAddressError"));
      return;
    }
    if (!paymentMethod) {
      toast.error(t("cart.missingPaymentMethodError"));
      return;
    }
    const phoneDigits = customerPhone.replace(/[^\d]/g, "");
    if (phoneDigits.length < 9) {
      toast.error(t("cart.missingPhoneError"));
      return;
    }

    setIsSubmitting(true);
    try {
      const name = await resolveCustomerName();
      const response = await createOrder({
        items: items.map((item) => ({
          productSlug: item.product.node.handle,
          quantity: item.quantity,
          snapshot: {
            name: item.product.node.title,
            price: parseFloat(item.price.amount),
            currency: item.price.currencyCode,
            imageUrl: item.product.node.images?.edges?.[0]?.node?.url ?? null,
          },
        })),
        ...(hasManualAddress ? { addressSnapshot: address.trim() } : {}),
        ...(zoneId ? { zoneId } : {}),
        customerName: name,
        customerPhone,
        paymentMethod,
        idempotencyKey: crypto.randomUUID(),
      });

      await clearCart();
      useCheckoutStore.getState().reset();
      setIsOpen(false);

      if (response.paymentUrl) {
        // Full browser navigation to the provider-hosted payment page — not
        // a router.navigate(), since this leaves the app entirely.
        window.location.href = response.paymentUrl;
        return;
      }

      await navigate({
        to: "/order-success",
        search: { orderNumber: response.order.orderNumber, orderId: response.order.id },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CashPaymentRequiresAuthentication" ||
          error.message.includes("Cash payment requires authentication") ||
          error.message.includes("Оплата наличными"))
      ) {
        toast.error(t("cart.cashRequiresAuthError"));
        return;
      }
      const message = error instanceof Error ? error.message : t("cart.checkoutFailedError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutBusy = isLoading || isSubmitting;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="relative h-11 rounded-full pl-4 pr-5 gap-2 bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="font-serif text-sm">{t("cart.yourCartTitle")}</span>
          {totalItems > 0 && (
            <Badge className="ml-1 h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs bg-accent text-accent-foreground border border-primary-foreground/30">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-serif text-2xl">{t("cart.yourCartTitle")}</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? t("cart.emptyDescription")
              : t(totalItems === 1 ? "cart.itemsInCartOne" : "cart.itemsInCartMany", {
                  count: totalItems,
                })}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-4 min-h-0">
          {items.length === 0 ? (
            // Этап №5 — beautiful, actionable empty state instead of just an
            // icon + caption: heading, description, and a direct way back
            // into the catalog (closes the sheet so it doesn't linger open
            // over the home page after navigating).
            <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <ShoppingCart className="h-9 w-9 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl">{t("cart.empty")}</h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {t("cart.emptyDescription")}
                </p>
              </div>
              <Button asChild size="lg" className="h-12 rounded-full px-8 gap-2">
                <Link to="/" onClick={() => setIsOpen(false)}>
                  <ArrowLeft className="h-4 w-4" /> {t("cart.emptyCta")}
                </Link>
              </Button>
            </div>
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
                      <div
                        key={item.variantId}
                        className="flex gap-3 rounded-2xl bg-secondary/40 p-3"
                      >
                        {/* Корзина → Товар (Этап №7 аудит навигации) — tapping
                            the photo or title opens the product page; the
                            sheet closes so the user lands directly on it.
                            Falls back to a non-interactive block for an
                            orphaned line with no resolvable slug, instead of
                            linking to a broken route. */}
                        {(() => {
                          // Этап №9, п.8 — an explicit "no photo" placeholder
                          // (matches ProductCard's own) instead of a blank
                          // colored box that could read as a loading/broken
                          // state.
                          const image = item.product.node.images?.edges?.[0]?.node;
                          const thumb = image ? (
                            <img
                              src={image.url}
                              alt={displayTitle}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-center text-[10px] leading-tight text-muted-foreground">
                              {t("common.noPhoto")}
                            </div>
                          );
                          return item.product.node.handle ? (
                            <Link
                              to="/product/$handle"
                              params={{ handle: item.product.node.handle }}
                              onClick={() => setIsOpen(false)}
                              className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary"
                            >
                              {thumb}
                            </Link>
                          ) : (
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                              {thumb}
                            </div>
                          );
                        })()}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            {/* Этап №9, п.9 — 2-line clamp instead of a hard
                                single-line truncate, so a long product name
                                stays legible instead of being cut down to a
                                few characters; still bounded so one item
                                can't grow the row unpredictably. */}
                            {item.product.node.handle ? (
                              <Link
                                to="/product/$handle"
                                params={{ handle: item.product.node.handle }}
                                onClick={() => setIsOpen(false)}
                                className="line-clamp-2 min-w-0 text-sm font-medium hover:underline"
                              >
                                {displayTitle}
                              </Link>
                            ) : (
                              <h4 className="line-clamp-2 min-w-0 text-sm font-medium">
                                {displayTitle}
                              </h4>
                            )}
                            {/* Direct removal, no confirmation dialog (п.6) —
                                a shortcut on top of the stepper's own
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
                            {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
                          </p>
                          {warning && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              {warning}
                            </p>
                          )}
                          {/* Quantity control lives directly on the cart row
                              (п.5) — same shared component/store as the
                              catalog and product page (Этап №4), so all three
                              always agree on the quantity. Line total sits
                              opposite it, always the up-to-date price × qty
                              (п.4, п.7 — recomputed every render). */}
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <CartQuantityControl product={item.product} size="lg" />
                            <span className="shrink-0 font-serif text-base font-semibold whitespace-nowrap">
                              {lineTotal.toFixed(2)} {item.price.currencyCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Этап №6 — sequential checkout, inline: address → delivery
                    method → payment method, right here in the cart, instead
                    of requiring a trip back to the home page's separate
                    dialogs (п.6, "без лишних переходов"). Same
                    useCheckoutStore fields/setters those dialogs already
                    use — filling it in here or there stays in sync either
                    way, and handleCheckout's validation below is untouched. */}
                <section className="mt-4 space-y-2">
                  <Label htmlFor="cart-address" className="text-sm font-medium">
                    {t("checkout.address")}
                  </Label>
                  <Input
                    id="cart-address"
                    type="text"
                    autoComplete="street-address"
                    placeholder={t("home.addressPlaceholder")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-11 rounded-xl px-4"
                    maxLength={200}
                  />
                  <Label htmlFor="cart-phone" className="text-sm font-medium">
                    {t("home.phoneLabel")}
                  </Label>
                  <Input
                    id="cart-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder={t("home.phonePlaceholder")}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-11 rounded-xl px-4"
                    maxLength={20}
                  />
                </section>

                <section className="mt-4 space-y-2">
                  <Label htmlFor="cart-zone" className="text-sm font-medium">
                    {t("home.deliveryZoneLabel")}
                  </Label>
                  <select
                    id="cart-zone"
                    value={zoneId ?? ""}
                    onChange={(e) => setZoneId(e.target.value || null)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
                  >
                    <option value="">{t("home.zoneNotSelected")}</option>
                    {(deliveryZones ?? []).map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </section>

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
              {/* Pinned bottom panel — total + checkout button always stay
                  in reach without scrolling (п.8), recomputed on every
                  render from live state (п.7). */}
              <div className="flex-shrink-0 space-y-3 pt-4 pb-safe border-t bg-background">
                {zoneId ? (
                  deliveryQuery.data && (
                    <div className="flex items-start gap-2 rounded-xl bg-secondary/40 px-4 py-3 text-sm">
                      <Truck className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <div>
                        <p>
                          {t("cart.deliveryLabel")}:{" "}
                          <strong>
                            {deliveryQuery.data.isFree
                              ? t("cart.free")
                              : `${deliveryQuery.data.fee.toFixed(2)} ${items[0]?.price.currencyCode || ""}`}
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
                              amount: deliveryQuery.data.freeFrom,
                              remaining: (deliveryQuery.data.freeFrom - totalPrice).toFixed(2),
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground px-1">{t("cart.zoneRequiredHint")}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg">{t("cart.total")}</span>
                  <span className="text-2xl font-serif font-semibold">
                    {totalPrice.toFixed(2)} {items[0]?.price.currencyCode || ""}
                  </span>
                </div>
                {/* Этап №9, п.3/13 — the single most visually prominent
                    control in the whole sheet: tallest, boldest text,
                    shadow — so checkout unmistakably reads as the primary
                    action, not just another button among the form controls
                    above it. */}
                <Button
                  onClick={handleCheckout}
                  className="w-full h-14 rounded-full text-lg font-semibold shadow-lg"
                  disabled={items.length === 0 || checkoutBusy}
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
      </SheetContent>
    </Sheet>
  );
};
