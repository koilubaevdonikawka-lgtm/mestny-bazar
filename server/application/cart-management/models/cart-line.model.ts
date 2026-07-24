/** Cart line — stores Customer ↔ Product ↔ Quantity only. */
export interface CartLine {
  readonly customerId: string;
  readonly productId: string;
  readonly quantity: number;
  readonly updatedAt: string;
}

export function createCartLine(
  customerId: string,
  productId: string,
  quantity: number,
): CartLine {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Cart line quantity must be a positive integer.");
  }

  return Object.freeze({
    customerId: customerId.trim(),
    productId: productId.trim(),
    quantity,
    updatedAt: new Date().toISOString(),
  });
}
