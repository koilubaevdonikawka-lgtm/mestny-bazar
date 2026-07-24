export interface OrderMoneyAmount {
  readonly amount: number;
  readonly currency: string;
}

/** Order line item within the Order capability module. */
export interface OrderItem {
  readonly id: string;
  readonly productId: string;
  readonly sellerId: string;
  readonly catalogId: string;
  readonly name: string;
  readonly price: OrderMoneyAmount;
  readonly quantity: number;
  readonly subtotal: OrderMoneyAmount;
}

export function createOrderItem(input: {
  id: string;
  productId: string;
  sellerId: string;
  catalogId: string;
  name: string;
  priceAmount: number;
  currency: string;
  quantity: number;
}): OrderItem {
  const currency = input.currency.trim();
  const priceAmount = Number(input.priceAmount.toFixed(2));
  const quantity = input.quantity;
  const subtotalAmount = Number((priceAmount * quantity).toFixed(2));

  return Object.freeze({
    id: input.id.trim(),
    productId: input.productId.trim(),
    sellerId: input.sellerId.trim(),
    catalogId: input.catalogId.trim(),
    name: input.name.trim(),
    price: Object.freeze({ amount: priceAmount, currency }),
    quantity,
    subtotal: Object.freeze({ amount: subtotalAmount, currency }),
  });
}

export function mergeOrderItems(items: readonly OrderItem[]): readonly OrderItem[] {
  const merged = new Map<string, OrderItem>();

  for (const item of items) {
    const existing = merged.get(item.productId);
    if (!existing) {
      merged.set(item.productId, item);
      continue;
    }

    merged.set(
      item.productId,
      createOrderItem({
        id: existing.id,
        productId: existing.productId,
        sellerId: existing.sellerId,
        catalogId: existing.catalogId,
        name: existing.name,
        priceAmount: existing.price.amount,
        currency: existing.price.currency,
        quantity: existing.quantity + item.quantity,
      }),
    );
  }

  return Object.freeze([...merged.values()]);
}
