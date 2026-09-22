import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { createOrder } from "@/api/orders";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { CreateOrderItemRequest, CreateOrderResponse } from "@shared/contracts/order";

/**
 * Order-submission core shared between CartDrawer's checkout and the
 * product page's "Купить в один клик" button (Часть 4 задачи о странице
 * товара) — same payment-method validation, same createOrder call, same
 * payment-redirect-or-success-page outcome either way. Only the `items`
 * list differs (the whole cart vs. a single product).
 *
 * Задача №182 — address/zone/phone/name are no longer collected here at
 * all: authentication and profile-completeness are gated by the caller
 * (useCheckoutReadiness, checked before this is ever invoked), and
 * CheckoutService resolves all four from the caller's saved Profile/default
 * Address server-side (CD-01 — never trust a client-echoed value for
 * something the account already has on file).
 */
export function useCreateOrder() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * `onCreated` runs right after the order exists but before the
   * payment-redirect/success-page branch — the same slot CartDrawer's
   * original inline handler used for clearCart/reset/close, since
   * `window.location.href` (payment redirect) leaves the SPA and anything
   * scheduled after it is unreliable.
   */
  const submitOrder = async (
    items: CreateOrderItemRequest[],
    onCreated?: (response: CreateOrderResponse) => void | Promise<void>,
    /**
     * Задача №300 — called instead of the old cart.cashRequiresAuthError
     * toast when the server rejects a CASH order for lacking a session
     * (RegisterPromptDialog, the same short message CartPanel's own
     * client-side auth gate already shows before ever reaching this point —
     * this server-side rejection should now be effectively unreachable in
     * practice, kept as defense in depth). Optional and falls back to the
     * old toast when omitted, so checkout.quick-buy.tsx (out of this
     * task's scope) keeps its exact current behavior unchanged.
     */
    onAuthRequired?: () => void,
  ): Promise<boolean> => {
    // Reads via useCheckoutStore.getState() rather than the reactive hook,
    // so a caller that does useCheckoutStore.getState().setPaymentMethod(...)
    // immediately before submitOrder() in the same synchronous handler (the
    // quick-buy page's two payment buttons — each click both picks and
    // submits) always sees that fresh value, not a stale one captured at
    // this hook's last render.
    const {
      paymentMethod,
      overrideAddress,
      overrideLatitude,
      overrideLongitude,
      overrideZoneId,
      notes,
    } = useCheckoutStore.getState();
    if (!paymentMethod) {
      toast.error(t("cart.missingPaymentMethodError"));
      return false;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrder({
        items,
        paymentMethod,
        idempotencyKey: useCheckoutStore.getState().getOrCreateIdempotencyKey(),
        // Задача №274 — free-text order comment, entered in the cart.
        // Backend already accepts/persists this (createOrderRequestSchema,
        // CheckoutService) — omitted entirely when blank, same convention
        // as every other optional field here.
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        // Задача №195 — "Отметить на карте" in the cart: a one-off address
        // for THIS order only, explicitly overriding the profile's saved
        // default address CheckoutService would otherwise resolve (never
        // written back to that saved Address). Omitted entirely when unset,
        // same as every checkout before this task.
        ...(overrideAddress
          ? {
              addressSnapshot: overrideAddress,
              ...(overrideLatitude != null && overrideLongitude != null
                ? { deliveryLatitude: overrideLatitude, deliveryLongitude: overrideLongitude }
                : {}),
              ...(overrideZoneId ? { zoneId: overrideZoneId } : {}),
            }
          : {}),
      });

      // Order created — this attempt reached a terminal outcome, so the next
      // checkout (this order or a brand new one) must mint a fresh key
      // rather than reuse this now-consumed one; the one-off address
      // override is a single-order concern too, must not silently apply to
      // whatever the customer orders next.
      useCheckoutStore.getState().resetIdempotencyKey();
      useCheckoutStore.getState().clearAddressOverride();

      if (onCreated) await onCreated(response);

      if (response.paymentUrl) {
        // Full browser navigation to the provider-hosted payment page — not
        // a router.navigate(), since this leaves the app entirely.
        window.location.href = response.paymentUrl;
        return true;
      }

      await navigate({
        to: "/order-success",
        search: { orderNumber: response.order.orderNumber, orderId: response.order.id },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "CashPaymentRequiresAuthentication" ||
          error.message.includes("Cash payment requires authentication") ||
          error.message.includes("Оплата наличными"))
      ) {
        if (onAuthRequired) {
          onAuthRequired();
        } else {
          toast.error(t("cart.cashRequiresAuthError"));
        }
        return false;
      }
      const message = error instanceof Error ? error.message : t("cart.checkoutFailedError");
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting };
}
