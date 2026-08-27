import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "@/api/profile";
import { listAddresses } from "@/api/addresses";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import type { AddressDTO } from "@shared/contracts/delivery";
import type { ProfileDTO } from "@shared/contracts/user";

export type CheckoutMissingField = "fullName" | "phone" | "address" | "zone";

export interface CheckoutReadiness {
  /** null while auth state or (once authenticated) profile/address data is still loading. */
  isReady: boolean | null;
  isAuthenticated: boolean | null;
  missing: CheckoutMissingField[];
  profile: ProfileDTO | null;
  defaultAddress: AddressDTO | null;
}

/**
 * Задача №182 — the single source of truth for "can this user check out
 * right now without re-entering anything": authenticated, has a name and
 * phone on the Profile, and a default saved Address with a zone. Used to
 * gate the "Оформить заказ" button in both CartPanel and quick-buy — mirrors
 * the same data CheckoutService.resolveAddress()/resolveCustomerContact()
 * resolve server-side, checked client-side first just to redirect early
 * with a clear reason instead of letting the request fail.
 */
export function useCheckoutReadiness(): CheckoutReadiness {
  const { isAuthenticated } = useSupabaseSession();

  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    enabled: isAuthenticated === true,
    retry: false,
  });

  const addressesQuery = useQuery({
    queryKey: ["addresses", "list"],
    queryFn: listAddresses,
    enabled: isAuthenticated === true,
    retry: false,
  });

  if (isAuthenticated !== true) {
    return {
      isReady: isAuthenticated === null ? null : false,
      isAuthenticated,
      missing: [],
      profile: null,
      defaultAddress: null,
    };
  }

  if (profileQuery.isLoading || addressesQuery.isLoading) {
    return { isReady: null, isAuthenticated, missing: [], profile: null, defaultAddress: null };
  }

  const profile = profileQuery.data ?? null;
  const defaultAddress = addressesQuery.data?.find((address) => address.isDefault) ?? null;

  const missing: CheckoutMissingField[] = [];
  if (!profile?.fullName?.trim()) missing.push("fullName");
  if (!profile?.phone?.trim()) missing.push("phone");
  if (!defaultAddress?.fullAddress?.trim()) missing.push("address");
  else if (!defaultAddress.zoneId) missing.push("zone");

  return { isReady: missing.length === 0, isAuthenticated, missing, profile, defaultAddress };
}
