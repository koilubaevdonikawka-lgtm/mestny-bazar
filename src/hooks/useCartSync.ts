import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";

const LEGACY_STORAGE_KEY = "shopify-cart";

/** One-time cleanup: the old Shopify-Cart-API store used a different shape under a different key. */
function discardLegacyCart(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return;
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const parsed = JSON.parse(legacy) as { state?: { items?: unknown[] } };
    if (parsed?.state?.items?.length) {
      toast.info("Ваша корзина была обновлена — добавьте товары заново.");
    }
  } catch {
    // Malformed legacy data — nothing to migrate, nothing to warn about.
  }
}

export function useCartSync() {
  const { isAuthenticated } = useSupabaseSession();
  const wasAuthenticated = useRef<boolean | null>(null);
  const validateCart = useCartStore((s) => s.validateCart);
  const syncFromServer = useCartStore((s) => s.syncFromServer);
  const mergeGuestIntoServer = useCartStore((s) => s.mergeGuestIntoServer);
  const resetToGuest = useCartStore((s) => s.resetToGuest);

  useEffect(() => {
    discardLegacyCart();
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return; // still resolving the initial session check

    const previous = wasAuthenticated.current;
    wasAuthenticated.current = isAuthenticated;

    if (isAuthenticated && previous !== true) {
      // Distinguish "already authenticated last session, just reloaded" (mode
      // was persisted as "authenticated" — nothing local to merge, only
      // refresh) from "was a guest, just signed in" (mode was "guest" —
      // fold the local cart into the server cart exactly once).
      if (useCartStore.getState().mode === "authenticated") {
        void syncFromServer();
      } else {
        void mergeGuestIntoServer();
      }
    } else if (!isAuthenticated && previous === true) {
      resetToGuest();
    }
  }, [isAuthenticated, syncFromServer, mergeGuestIntoServer, resetToGuest]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") void validateCart();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [validateCart]);
}
