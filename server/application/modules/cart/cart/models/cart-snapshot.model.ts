import type { CartItem } from "@server/application/modules/cart/cart/models/cart-item.model";

export interface CartTotals {
  readonly subtotal: number;
  readonly itemCount: number;
  readonly currency: string;
}

/** Immutable cart snapshot for a single customer. */
export interface CartSnapshot {
  readonly customerId: string;
  readonly items: readonly CartItem[];
  readonly totals: CartTotals;
  readonly updatedAt: string;
}

export function createCartSnapshot(
  customerId: string,
  items: readonly CartItem[],
  currency: string,
): CartSnapshot {
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.priceAmount * item.quantity, 0).toFixed(2),
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return Object.freeze({
    customerId,
    items: Object.freeze([...items]),
    totals: Object.freeze({
      subtotal,
      itemCount,
      currency,
    }),
    updatedAt: new Date().toISOString(),
  });
}

export function emptyCartSnapshot(customerId: string, currency = "KGS"): CartSnapshot {
  return createCartSnapshot(customerId, [], currency);
}
