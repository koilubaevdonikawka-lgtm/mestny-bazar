import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { createOrder } from "@/api/orders";
import { useTranslation } from "@/i18n/LanguageProvider";
import { validateGuestContact } from "@/lib/guest-contact-validation";
import type { CreateOrderItemRequest, CreateOrderResponse } from "@shared/contracts/order";

/**
 * Order-submission core shared between CartDrawer's checkout and the
 * product page's "Купить в один клик" button (Часть 4 задачи о странице
 * товара) — same payment-method validation, same createOrder call, same
 * payment-redirect-or-success-page outcome either way. Only the `items`
 * list differs (the whole cart vs. a single product).
 *
 * Signed in: address/zone/phone/name are not sent — CheckoutService
 * resolves all four from the saved Profile/default Address server-side
 * (Задача №182, CD-01), after the caller checked useCheckoutReadiness.
 *
 * Задача №314 — guest (`options.guest`): no Profile to resolve from, so the
 * phone and address the buyer typed into the cart are sent explicitly,
 * both required, plus the optional zone. The name isn't asked for in the cart —
 * the optional name from the guest's local /profile is sent when set, else it
 * falls back to cart.defaultCustomerName, exactly as guest checkout did
 * before №182 (the server needs some name; the phone is what staff use).
 */
export interface GuestCheckoutContact {
  name?: string;
  phone: string;
  address: string;
  zoneId: string | null;
}

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
    options: { guest?: GuestCheckoutContact } = {},
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
    const guest = options.guest;
    if (guest) {
      const { addressValid, phoneValid } = validateGuestContact(guest);
      if (!addressValid) {
        toast.error(t("home.enterFullAddressError"));
        return false;
      }
      if (!phoneValid) {
        toast.error(t("home.invalidPhoneError"));
        return false;
      }
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
        ...(guest
          ? {
              addressSnapshot: guest.address.trim(),
              customerPhone: guest.phone.trim(),
              customerName: guest.name?.trim() || t("cart.defaultCustomerName"),
              ...(guest.zoneId ? { zoneId: guest.zoneId } : {}),
            }
          : {}),
        // Задача №195 — "Отметить на карте" in the cart: a one-off address
        // for THIS order only, explicitly overriding the profile's saved
        // default address CheckoutService would otherwise resolve (never
        // written back to that saved Address). Omitted entirely when unset,
        // same as every checkout before this task.
        ...(!guest && overrideAddress
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
      const message = error instanceof Error ? error.message : t("cart.checkoutFailedError");
      toast.error(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting };
}
