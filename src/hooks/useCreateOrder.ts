import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { createOrder } from "@/api/orders";
import { useTranslation } from "@/i18n/LanguageProvider";
import type { CreateOrderItemRequest, CreateOrderResponse } from "@shared/contracts/order";

/**
 * Order-submission core shared between CartDrawer's checkout and the
 * product page's "Купить в один клик" button (Часть 4 задачи о странице
 * товара) — same validation (address/payment method/phone from
 * useCheckoutStore), same customer-name resolution, same createOrder call,
 * same payment-redirect-or-success-page outcome either way. Only the
 * `items` list differs (the whole cart vs. a single product).
 */
export function useCreateOrder() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reads via useCheckoutStore.getState() rather than the reactive hook,
  // so a caller that does useCheckoutStore.getState().setPaymentMethod(...)
  // immediately before submitOrder() in the same synchronous handler (the
  // quick-buy page's two payment buttons — each click both picks and
  // submits) always sees that fresh value, not a stale one captured at this
  // hook's last render.
  const resolveCustomerName = async (): Promise<string> => {
    const { customerName, setCustomerName } = useCheckoutStore.getState();
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
  ): Promise<boolean> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session?.user;
    const { address, zoneId, paymentMethod, customerPhone } = useCheckoutStore.getState();
    const hasManualAddress = address.trim().length >= 5;

    if (!isAuthenticated && !hasManualAddress) {
      toast.error(t("cart.missingAddressError"));
      return false;
    }
    if (!paymentMethod) {
      toast.error(t("cart.missingPaymentMethodError"));
      return false;
    }
    const phoneDigits = customerPhone.replace(/[^\d]/g, "");
    if (phoneDigits.length < 9) {
      toast.error(t("cart.missingPhoneError"));
      return false;
    }

    setIsSubmitting(true);
    try {
      const name = await resolveCustomerName();
      const response = await createOrder({
        items,
        ...(hasManualAddress ? { addressSnapshot: address.trim() } : {}),
        ...(zoneId ? { zoneId } : {}),
        customerName: name,
        customerPhone,
        paymentMethod,
        idempotencyKey: useCheckoutStore.getState().getOrCreateIdempotencyKey(),
      });

      // Order created — this attempt reached a terminal outcome, so the next
      // checkout (this order or a brand new one) must mint a fresh key
      // rather than reuse this now-consumed one.
      useCheckoutStore.getState().resetIdempotencyKey();

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
        toast.error(t("cart.cashRequiresAuthError"));
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
