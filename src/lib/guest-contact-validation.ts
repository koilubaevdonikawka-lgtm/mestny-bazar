import { useCheckoutStore } from "@/stores/checkoutStore";

/**
 * Client-side guest checkout requirements (Задача №314) — the single place both
 * useCreateOrder (blocks the request) and GuestCheckoutFields (highlights the
 * fields) read, so the two can never disagree. CheckoutService re-validates
 * server-side; these mirror its minimums.
 */
export const MIN_GUEST_ADDRESS_LENGTH = 5;
export const MIN_PHONE_DIGITS = 9;

export interface GuestContactValidity {
  addressValid: boolean;
  phoneValid: boolean;
}

export function validateGuestContact(contact: {
  address: string;
  phone: string;
}): GuestContactValidity {
  return {
    addressValid: contact.address.trim().length >= MIN_GUEST_ADDRESS_LENGTH,
    phoneValid: contact.phone.replace(/\D/g, "").length >= MIN_PHONE_DIGITS,
  };
}

/**
 * Checks the guest's draft before submitting; if a required field is missing,
 * moves focus to the first invalid one and returns false (the caller then shows
 * the highlights via `showErrors`). Same rules as useCreateOrder.
 */
export function guestContactReadyOrFocus(): boolean {
  const { guestAddress, guestPhone } = useCheckoutStore.getState();
  const { addressValid, phoneValid } = validateGuestContact({
    address: guestAddress,
    phone: guestPhone,
  });
  if (addressValid && phoneValid) return true;
  const firstInvalid = !addressValid ? "guest-address" : "guest-phone";
  const input = document.getElementById(firstInvalid);
  input?.scrollIntoView({ block: "center", behavior: "smooth" });
  input?.focus({ preventScroll: true });
  return false;
}
