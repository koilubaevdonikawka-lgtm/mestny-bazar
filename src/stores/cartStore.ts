import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import type {
  CartItemDTO,
  CartLineIdentifier,
  CartLineInput,
  CartValidationResult,
} from "@shared/contracts/cart";
import {
  addCartItem,
  clearCart as clearServerCart,
  getCart,
  mergeGuestCart,
  removeCartItem,
  updateCartItem,
  validateCart as validateCartRequest,
} from "@/api/cart";

export interface CartItem {
  product: CatalogProductNode;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

/**
 * A cart line is identified by product.node.handle, which toCatalogProductNode
 * sets to the product's own slug (shared/lib/product-adapter.ts) — the same
 * identity CartDrawer's checkout request resolves against.
 */
function toIdentifier(item: Pick<CartItem, "product">): CartLineIdentifier {
  return { productSlug: item.product.node.handle };
}

function toLineInput(item: CartItem): CartLineInput {
  return {
    ...toIdentifier(item),
    quantity: item.quantity,
    snapshot: {
      name: item.product.node.title,
      price: parseFloat(item.price.amount),
      currency: item.price.currencyCode,
      imageUrl: item.product.node.images?.edges?.[0]?.node?.url ?? null,
    },
  };
}

/**
 * Задача №184 — per-variant debounce state for stepQuantity, module-scope
 * (not store state): timers aren't serializable and have no business
 * surviving a page reload anyway, and every CartQuantityControl instance
 * for the same variant (grid card + cart row) must share the same pending
 * timer/rollback-target regardless of which instance's button was clicked.
 */
const quantityDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
/** The last server-confirmed quantity for a variant with a debounce in flight — what a failed commit rolls back to. */
const lastConfirmedQuantities = new Map<string, number>();
const QUANTITY_DEBOUNCE_MS = 3000;

/**
 * True when the server rejected the request because the bearer token was
 * missing/invalid (`server/auth/resolve-user.ts` → `UnauthorizedError`) —
 * i.e. `mode` says "authenticated" but the session backing it is actually
 * dead (expired between page-load and this call, revoked, or the
 * useCartSync resync effect simply hasn't run yet). Distinguishes that
 * specific, recoverable case from a real network/server failure.
 */
function isUnauthorized(e: unknown): boolean {
  return e instanceof Error && e.name === "UnauthorizedError";
}

/** Reconstructs a renderable CartItem purely from the server's stored snapshot. */
function fromCartItemDTO(dto: CartItemDTO): CartItem {
  const variantId = dto.productSlug ?? dto.productId ?? "";
  return {
    product: {
      node: {
        id: variantId,
        title: dto.name,
        description: "",
        handle: dto.productSlug ?? "",
        priceRange: {
          minVariantPrice: { amount: dto.price.toFixed(2), currencyCode: dto.currency },
        },
        images: {
          edges: dto.imageUrl ? [{ node: { url: dto.imageUrl, altText: dto.name } }] : [],
        },
        // Этап №5 — mirrors toCatalogProductNode's single synthetic variant
        // shape exactly (id = variantId, availableForSale = true) rather
        // than leaving this empty: CartQuantityControl (reused inside
        // CartDrawer to render the [-] qty [+] stepper) reads
        // product.node.variants.edges[0] the same way for every caller — an
        // empty array here would silently make it fall back to the "Add to
        // cart" state for every authenticated-user cart line.
        variants: {
          edges: [
            {
              node: {
                id: variantId,
                title: dto.name,
                price: { amount: dto.price.toFixed(2), currencyCode: dto.currency },
                availableForSale: true,
                selectedOptions: [],
              },
            },
          ],
        },
        options: [],
        // The cart snapshot (CartItemDTO) never carried these — live stock is
        // re-checked separately by validateCart, not read off this node.
        unit: null,
        manufacturer: null,
        countryOfOrigin: null,
        stock: 0,
        inStock: true,
        category: null,
        sortOrder: null,
      },
    },
    variantId,
    variantTitle: dto.name,
    price: { amount: dto.price.toFixed(2), currencyCode: dto.currency },
    quantity: dto.quantity,
    selectedOptions: [],
  };
}

interface CartStore {
  items: CartItem[];
  /** "authenticated" means the server cart is the source of truth; "guest" means localStorage is. */
  mode: "guest" | "authenticated";
  isLoading: boolean;
  /**
   * Задача №181 — per-variant in-flight tracking, separate from `isLoading`
   * above. `isLoading` is a single global flag (CartPanel's checkout button
   * correctly waits on "any cart operation in flight" — that use is
   * unchanged), but every `CartQuantityControl` instance on a page (the
   * product list, Задача №179/180) also read that SAME global flag for its
   * own spinner/disabled state — adding one product showed a loading
   * spinner on every OTHER product card too, since none of them were
   * scoped to "is *this* variant's request in flight". This set holds
   * exactly the variantIds with a request in flight right now.
   */
  pendingVariantIds: Set<string>;
  /** Resolves true only if the item was actually added — callers must not show a success toast otherwise. */
  addItem: (item: CartItem) => Promise<boolean>;
  /**
   * Задача №184 — replaces the old updateQuantity: applies the new quantity
   * to local state immediately (no network call, no loading state on this
   * click), then debounces the actual server sync by QUANTITY_DEBOUNCE_MS —
   * a burst of +/- clicks collapses into a single request fired 3s after the
   * last one, instead of one request (and one loading spinner) per click.
   * A target quantity <= 0 skips the debounce entirely and goes straight to
   * removeItem — deletion is already an immediate, deliberate action
   * elsewhere in this UI (the cart row's own trash button), so reaching
   * zero via the stepper takes the same immediate path rather than sitting
   * around for 3 more seconds first.
   */
  stepQuantity: (variantId: string, delta: number) => void;
  /** Internal — the debounced server sync stepQuantity schedules; not meant to be called directly by UI code. */
  commitQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  /** Re-validates every line against IProductRepository; returns null if the cart is empty or the check failed. */
  validateCart: () => Promise<CartValidationResult | null>;
  /** Loads the authenticated user's server cart, replacing local state with it. */
  syncFromServer: () => Promise<void>;
  /** Folds the current (guest) items into the server cart, then switches to server mode. Safe to call with an empty cart. */
  mergeGuestIntoServer: () => Promise<void>;
  /** Called on sign-out — the server cart belongs to a specific user and must not leak into the next anonymous session. */
  resetToGuest: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      mode: "guest",
      isLoading: false,
      pendingVariantIds: new Set(),

      addItem: async (item) => {
        const { items, mode } = get();

        if (mode === "guest") {
          const existingIndex = items.findIndex((i) => i.variantId === item.variantId);
          if (existingIndex >= 0) {
            set({
              items: items.map((i, idx) =>
                idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            });
          } else {
            set({ items: [...items, item] });
          }
          return true;
        }

        set((state) => ({
          isLoading: true,
          pendingVariantIds: new Set(state.pendingVariantIds).add(item.variantId),
        }));
        try {
          const cart = await addCartItem(toLineInput(item));
          set({ items: cart.items.map(fromCartItemDTO) });
          return true;
        } catch (e) {
          if (isUnauthorized(e)) {
            // Session is actually dead despite the persisted "authenticated"
            // mode — fall back to a local guest add instead of a dead end so
            // the item the user just clicked doesn't just vanish.
            const current = get().items;
            const existingIndex = current.findIndex((i) => i.variantId === item.variantId);
            set({
              mode: "guest",
              items:
                existingIndex >= 0
                  ? current.map((i, idx) =>
                      idx === existingIndex ? { ...i, quantity: i.quantity + item.quantity } : i,
                    )
                  : [...current, item],
            });
            return true;
          }
          console.error("Failed to add item:", e);
          toast.error("Не удалось добавить товар в корзину. Попробуйте ещё раз.");
          return false;
        } finally {
          set((state) => {
            const pendingVariantIds = new Set(state.pendingVariantIds);
            pendingVariantIds.delete(item.variantId);
            return { isLoading: false, pendingVariantIds };
          });
        }
      },

      stepQuantity: (variantId, delta) => {
        const { items, mode } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item) return;
        const nextQuantity = item.quantity + delta;

        if (nextQuantity <= 0) {
          const existingTimer = quantityDebounceTimers.get(variantId);
          if (existingTimer) clearTimeout(existingTimer);
          quantityDebounceTimers.delete(variantId);
          lastConfirmedQuantities.delete(variantId);
          void get().removeItem(variantId);
          return;
        }

        if (mode === "guest") {
          set({
            items: items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: nextQuantity } : i,
            ),
          });
          return;
        }

        // Optimistic — the displayed quantity changes now, no loading state.
        // Only remember the pre-burst quantity once per burst (the first
        // click), so a rollback after several clicks restores the value
        // before ANY of them, not just the last one.
        if (!lastConfirmedQuantities.has(variantId)) {
          lastConfirmedQuantities.set(variantId, item.quantity);
        }
        set({
          items: items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: nextQuantity } : i,
          ),
        });

        const existingTimer = quantityDebounceTimers.get(variantId);
        if (existingTimer) clearTimeout(existingTimer);
        quantityDebounceTimers.set(
          variantId,
          setTimeout(() => {
            quantityDebounceTimers.delete(variantId);
            void get().commitQuantity(variantId, nextQuantity);
          }, QUANTITY_DEBOUNCE_MS),
        );
      },

      /** Задача №184 — fires QUANTITY_DEBOUNCE_MS after the last stepQuantity call for this variant; not meant to be called directly by UI code. */
      commitQuantity: async (variantId, quantity) => {
        const item = get().items.find((i) => i.variantId === variantId);
        if (!item) {
          lastConfirmedQuantities.delete(variantId);
          return;
        }

        try {
          const cart = await updateCartItem(toIdentifier(item), quantity);
          set({ items: cart.items.map(fromCartItemDTO) });
          lastConfirmedQuantities.delete(variantId);
        } catch (e) {
          if (isUnauthorized(e)) {
            // Session is actually dead — same fallback as addItem/removeItem:
            // drop to guest mode and keep the optimistic quantity as the new
            // local truth (there's no live server value left to roll back to).
            set({ mode: "guest" });
            lastConfirmedQuantities.delete(variantId);
            return;
          }
          console.error("Failed to update quantity:", e);
          const rollbackQuantity = lastConfirmedQuantities.get(variantId);
          lastConfirmedQuantities.delete(variantId);
          if (rollbackQuantity != null) {
            set((state) => ({
              items: state.items.map((i) =>
                i.variantId === variantId ? { ...i, quantity: rollbackQuantity } : i,
              ),
            }));
          }
          toast.error("Не удалось обновить количество товара. Попробуйте ещё раз.");
        }
      },

      removeItem: async (variantId) => {
        const { items, mode } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item) return;

        if (mode === "guest") {
          set({ items: items.filter((i) => i.variantId !== variantId) });
          return;
        }

        set((state) => ({
          isLoading: true,
          pendingVariantIds: new Set(state.pendingVariantIds).add(variantId),
        }));
        try {
          const cart = await removeCartItem(toIdentifier(item));
          set({ items: cart.items.map(fromCartItemDTO) });
        } catch (e) {
          if (isUnauthorized(e)) {
            const current = get().items;
            set({ mode: "guest", items: current.filter((i) => i.variantId !== variantId) });
            return;
          }
          console.error("Failed to remove item:", e);
          toast.error("Не удалось удалить товар из корзины. Попробуйте ещё раз.");
        } finally {
          set((state) => {
            const pendingVariantIds = new Set(state.pendingVariantIds);
            pendingVariantIds.delete(variantId);
            return { isLoading: false, pendingVariantIds };
          });
        }
      },

      clearCart: async () => {
        const { mode } = get();
        set({ items: [] });
        if (mode === "authenticated") {
          try {
            await clearServerCart();
          } catch (e) {
            console.error("Failed to clear server cart:", e);
          }
        }
      },

      validateCart: async () => {
        const { items } = get();
        if (!items.length) return null;
        try {
          return await validateCartRequest(items.map(toLineInput));
        } catch (e) {
          console.error("Failed to validate cart:", e);
          return null;
        }
      },

      syncFromServer: async () => {
        set({ isLoading: true });
        try {
          const cart = await getCart();
          set({ items: cart.items.map(fromCartItemDTO), mode: "authenticated" });
        } catch (e) {
          console.error("Failed to load cart:", e);
        } finally {
          set({ isLoading: false });
        }
      },

      mergeGuestIntoServer: async () => {
        if (get().mode === "authenticated") return;
        const { items } = get();
        set({ isLoading: true });
        try {
          const cart = items.length
            ? await mergeGuestCart(items.map(toLineInput))
            : await getCart();
          set({ items: cart.items.map(fromCartItemDTO), mode: "authenticated" });
        } catch (e) {
          console.error("Failed to merge guest cart:", e);
        } finally {
          set({ isLoading: false });
        }
      },

      resetToGuest: () => set({ items: [], mode: "guest" }),
    }),
    {
      name: "platform-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, mode: state.mode }),
    },
  ),
);
