import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PaymentMethod } from "@shared/contracts/order";

/**
 * Задача №182 — address/deliveryLatitude/deliveryLongitude/zoneId/
 * customerPhone/customerName used to live here as the cart's in-progress
 * checkout draft; all five moved to the Profile/default Address (filled
 * once, reused by every future order) and are resolved server-side by
 * CheckoutService.
 *
 * Задача №195 — one of those five is back, but scoped differently:
 * overrideAddress/overrideLatitude/overrideLongitude/overrideZoneId are a
 * ONE-OFF replacement for a single upcoming order only ("Отметить на
 * карте" in the cart) — never written to the saved profile Address (that's
 * what the same button inside the profile's own edit form does instead),
 * and cleared once an order actually gets created from it.
 *
 * Задача №314 — guest checkout is back: guestPhone/guestAddress/guestZoneId
 * are what a signed-out buyer types into the cart (they have no Profile for
 * CheckoutService to resolve these from). Persisted, and deliberately kept
 * across reset(), so a returning guest doesn't retype them for every order;
 * unused (ignored) once signed in, where the profile is the source.
 *
 * guestName (optional) joins them as the signed-out buyer's local "profile":
 * /profile edits these same four fields for a guest, so the cart's guest
 * form is prefilled from them — one localStorage-backed source, no copy.
 * Device-local by design: never synced to the server or across devices.
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
  /** Задача №195 — set together via the cart's "Отметить на карте"; null means "use the profile's saved default address" (the normal case). */
  overrideAddress: string | null;
  overrideLatitude: number | null;
  overrideLongitude: number | null;
  /**
   * The default address's OWN zone at the moment the override was set — the
   * map pin only replaces the address text/point, not the delivery zone
   * (there's no zone picker here); carried along so the order's delivery
   * fee still resolves correctly instead of coming back zone-less.
   */
  overrideZoneId: string | null;
  /** Задача №274 — free-text order comment, entered in the cart before checkout. Persisted (a partially-typed comment should survive a reload) and cleared by reset() once an order is actually placed, same lifecycle as paymentMethod/override*. */
  notes: string;
  guestName: string;
  guestPhone: string;
  guestAddress: string;
  /** Optional — only drives the delivery fee; no zone means no delivery fee is quoted/charged, same as before Задача №182. */
  guestZoneId: string | null;
  setGuestContact: (
    contact: Partial<{ name: string; phone: string; address: string; zoneId: string | null }>,
  ) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  /** Returns the current attempt's key, minting one on first call so every retry of the same attempt (network failure, re-click) reuses it instead of getting a fresh one. */
  getOrCreateIdempotencyKey: () => string;
  /** Call once an attempt reaches a terminal outcome (order created) so the next checkout starts a new attempt with a new key. */
  resetIdempotencyKey: () => void;
  setAddressOverride: (override: {
    address: string;
    latitude: number;
    longitude: number;
    zoneId: string | null;
  }) => void;
  /** Reverts to "use the profile's saved default address" — the map pick was only ever a one-off replacement, this un-does it. */
  clearAddressOverride: () => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialState = {
  paymentMethod: null as PaymentMethod | null,
  idempotencyKey: null as string | null,
  overrideAddress: null as string | null,
  overrideLatitude: null as number | null,
  overrideLongitude: null as number | null,
  overrideZoneId: null as string | null,
  notes: "",
};

const initialGuestContact = {
  guestName: "",
  guestPhone: "",
  guestAddress: "",
  guestZoneId: null as string | null,
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      ...initialGuestContact,
      setGuestContact: ({ name, phone, address, zoneId }) =>
        set({
          ...(name !== undefined ? { guestName: name } : {}),
          ...(phone !== undefined ? { guestPhone: phone } : {}),
          ...(address !== undefined ? { guestAddress: address } : {}),
          ...(zoneId !== undefined ? { guestZoneId: zoneId } : {}),
        }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      getOrCreateIdempotencyKey: () => {
        const existing = get().idempotencyKey;
        if (existing) return existing;
        const key = crypto.randomUUID();
        set({ idempotencyKey: key });
        return key;
      },
      resetIdempotencyKey: () => set({ idempotencyKey: null }),
      setAddressOverride: ({ address, latitude, longitude, zoneId }) =>
        set({
          overrideAddress: address,
          overrideLatitude: latitude,
          overrideLongitude: longitude,
          overrideZoneId: zoneId,
        }),
      clearAddressOverride: () =>
        set({
          overrideAddress: null,
          overrideLatitude: null,
          overrideLongitude: null,
          overrideZoneId: null,
        }),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialState),
    }),
    {
      name: "platform-checkout",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        paymentMethod: state.paymentMethod,
        overrideAddress: state.overrideAddress,
        overrideLatitude: state.overrideLatitude,
        overrideLongitude: state.overrideLongitude,
        overrideZoneId: state.overrideZoneId,
        notes: state.notes,
        guestName: state.guestName,
        guestPhone: state.guestPhone,
        guestAddress: state.guestAddress,
        guestZoneId: state.guestZoneId,
      }),
    },
  ),
);
