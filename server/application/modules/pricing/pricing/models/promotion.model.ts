/** Promotion owned by the Pricing capability module. */
export interface Promotion {
  readonly id: string;
  readonly name: string;
  readonly productId: string | null;
  readonly percentage: number | null;
  readonly fixedAmount: number | null;
  readonly currency: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createPromotion(input: {
  id: string;
  name: string;
  productId?: string | null;
  percentage?: number | null;
  fixedAmount?: number | null;
  currency: string;
  active?: boolean;
}): Promotion {
  if (!input.name?.trim()) {
    throw new Error("Promotion name is required.");
  }
  if (input.percentage == null && input.fixedAmount == null) {
    throw new Error("Promotion must define either percentage or fixed amount.");
  }

  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    productId: input.productId?.trim() || null,
    percentage: input.percentage ?? null,
    fixedAmount: input.fixedAmount ?? null,
    currency: input.currency.trim().toUpperCase(),
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function calculatePromotionAmount(
  promotion: Promotion,
  subtotal: number,
): number {
  if (!promotion.active) {
    return 0;
  }

  if (promotion.percentage != null) {
    return Number(((subtotal * promotion.percentage) / 100).toFixed(2));
  }

  return Number((promotion.fixedAmount ?? 0).toFixed(2));
}
