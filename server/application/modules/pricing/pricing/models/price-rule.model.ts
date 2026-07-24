/** Pricing rule owned by the Pricing capability module. */
export interface PriceRule {
  readonly id: string;
  readonly productId: string;
  readonly minQuantity: number;
  readonly amount: number;
  readonly currency: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createPriceRule(input: {
  id: string;
  productId: string;
  minQuantity: number;
  amount: number;
  currency: string;
  active?: boolean;
}): PriceRule {
  if (!Number.isInteger(input.minQuantity) || input.minQuantity < 1) {
    throw new Error("Price rule minimum quantity must be a positive integer.");
  }

  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    productId: input.productId.trim(),
    minQuantity: input.minQuantity,
    amount: Number(input.amount.toFixed(2)),
    currency: input.currency.trim().toUpperCase(),
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}
