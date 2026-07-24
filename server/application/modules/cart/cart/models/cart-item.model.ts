/** Line item stored inside a customer cart. */
export interface CartItem {
  readonly productId: string;
  readonly sellerId: string;
  readonly catalogId: string;
  readonly name: string;
  readonly priceAmount: number;
  readonly currency: string;
  readonly quantity: number;
}

export function createCartItem(input: Omit<CartItem, "quantity"> & { quantity?: number }): CartItem {
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Cart item quantity must be a positive integer.");
  }

  return Object.freeze({
    productId: input.productId,
    sellerId: input.sellerId,
    catalogId: input.catalogId,
    name: input.name,
    priceAmount: Number(input.priceAmount.toFixed(2)),
    currency: input.currency,
    quantity,
  });
}

export function cartItemSubtotal(item: CartItem): number {
  return Number((item.priceAmount * item.quantity).toFixed(2));
}
