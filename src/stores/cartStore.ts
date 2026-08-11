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
  /** Resolves true only if the item was actually added — callers must not show a success toast otherwise. */
  addItem: (item: CartItem) => Promise<boolean>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
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

        set({ isLoading: true });
        try {
          const cart = await addCartItem(toLineInput(item));
          set({ items: cart.items.map(fromCartItemDTO) });
          return true;
        } catch (e) {
          console.error("Failed to add item:", e);
          toast.error("Не удалось добавить товар в корзину. Попробуйте ещё раз.");
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, mode } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item) return;

        if (mode === "guest") {
          set({ items: items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)) });
          return;
        }

        set({ isLoading: true });
        try {
          const cart = await updateCartItem(toIdentifier(item), quantity);
          set({ items: cart.items.map(fromCartItemDTO) });
        } catch (e) {
          console.error("Failed to update quantity:", e);
          toast.error("Не удалось обновить количество товара. Попробуйте ещё раз.");
        } finally {
          set({ isLoading: false });
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

        set({ isLoading: true });
        try {
          const cart = await removeCartItem(toIdentifier(item));
          set({ items: cart.items.map(fromCartItemDTO) });
        } catch (e) {
          console.error("Failed to remove item:", e);
          toast.error("Не удалось удалить товар из корзины. Попробуйте ещё раз.");
        } finally {
          set({ isLoading: false });
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
