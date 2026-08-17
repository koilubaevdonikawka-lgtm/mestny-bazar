import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PaymentMethod } from "@shared/contracts/order";

interface CheckoutStore {
  address: string;
  /** docs/delivery/ — selected in the "Доставка оплата и статус" dialog; sent as CreateOrderRequest.zoneId for guest checkout. */
  zoneId: string | null;
  paymentMethod: PaymentMethod | null;
  customerPhone: string;
  customerName: string;
  /**
   * One idempotency key per in-flight order-creation attempt cluster — not
   * per HTTP request. Deliberately excluded from `partialize` (memory-only,
   * not persisted to localStorage): it must not outlive the browser tab in a
   * way that lets a stale key get reused by an unrelated future checkout.
   */
  idempotencyKey: string | null;
  setAddress: (address: string) => void;
  setZoneId: (zoneId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerName: (name: string) => void;
  /** Returns the current attempt's key, minting one on first call so every retry of the same attempt (network failure, re-click) reuses it instead of getting a fresh one. */
  getOrCreateIdempotencyKey: () => string;
  /** Call once an attempt reaches a terminal outcome (order created) so the next checkout starts a new attempt with a new key. */
  resetIdempotencyKey: () => void;
  reset: () => void;
}

const initialState = {
  address: "",
  zoneId: null as string | null,
  paymentMethod: null as PaymentMethod | null,
  customerPhone: "",
  customerName: "",
  idempotencyKey: null as string | null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setAddress: (address) => set({ address }),
      setZoneId: (zoneId) => set({ zoneId }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setCustomerPhone: (customerPhone) => set({ customerPhone }),
      setCustomerName: (customerName) => set({ customerName }),
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
        address: state.address,
        zoneId: state.zoneId,
        paymentMethod: state.paymentMethod,
        customerPhone: state.customerPhone,
        customerName: state.customerName,
      }),
    },
  ),
);
