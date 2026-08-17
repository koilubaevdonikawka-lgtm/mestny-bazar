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
  setAddress: (address: string) => void;
  setZoneId: (zoneId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerName: (name: string) => void;
  reset: () => void;
}

const initialState = {
  address: "",
  zoneId: null as string | null,
  paymentMethod: null as PaymentMethod | null,
  customerPhone: "",
  customerName: "",
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAddress: (address) => set({ address }),
      setZoneId: (zoneId) => set({ zoneId }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setCustomerPhone: (customerPhone) => set({ customerPhone }),
      setCustomerName: (customerName) => set({ customerName }),
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
