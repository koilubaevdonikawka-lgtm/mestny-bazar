import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PaymentMethod } from "@shared/contracts/order";

/**
 * Задача №182 — address/deliveryLatitude/deliveryLongitude/zoneId/
 * customerPhone/customerName used to live here as the cart's in-progress
 * checkout draft; all five moved to the Profile/default Address (filled
 * once, reused by every future order) and are resolved server-side by
 * CheckoutService. Only the payment method choice and the idempotency key
 * remain a per-checkout-attempt concern.
 */
interface CheckoutStore {
  paymentMethod: PaymentMethod | null;
  /**
   * One idempotency key per in-flight order-creation attempt cluster — not
   * per HTTP request. Deliberately excluded from `partialize` (memory-only,
   * not persisted to localStorage): it must not outlive the browser tab in a
   * way that lets a stale key get reused by an unrelated future checkout.
   */
  idempotencyKey: string | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  /** Returns the current attempt's key, minting one on first call so every retry of the same attempt (network failure, re-click) reuses it instead of getting a fresh one. */
  getOrCreateIdempotencyKey: () => string;
  /** Call once an attempt reaches a terminal outcome (order created) so the next checkout starts a new attempt with a new key. */
  resetIdempotencyKey: () => void;
  reset: () => void;
}

const initialState = {
  paymentMethod: null as PaymentMethod | null,
  idempotencyKey: null as string | null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      getOrCreateIdempotencyKey: () => {
        const existing = get().idempotencyKey;
        if (existing) return existing;
        const key = crypto.randomUUID();
        set({ idempotencyKey: key });
        return key;
      },
      resetIdempotencyKey: () => set({ idempotencyKey: null }),
      reset: () => set(initialState),
    }),
    {
      name: "platform-checkout",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        paymentMethod: state.paymentMethod,
      }),
    },
  ),
);
