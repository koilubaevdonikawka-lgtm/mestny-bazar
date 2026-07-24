/** Discount owned by the Pricing capability module. */
export interface Discount {
  readonly id: string;
  readonly code: string;
  readonly productId: string | null;
  readonly percentage: number | null;
  readonly fixedAmount: number | null;
  readonly currency: string;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createDiscount(input: {
  id: string;
  code: string;
  productId?: string | null;
  percentage?: number | null;
  fixedAmount?: number | null;
  currency: string;
  active?: boolean;
}): Discount {
  if (!input.code?.trim()) {
    throw new Error("Discount code is required.");
  }
  if (input.percentage == null && input.fixedAmount == null) {
    throw new Error("Discount must define either percentage or fixed amount.");
  }

  const timestamp = new Date().toISOString();

  return Object.freeze({
    id: input.id.trim(),
    code: input.code.trim().toUpperCase(),
    productId: input.productId?.trim() || null,
    percentage: input.percentage ?? null,
    fixedAmount: input.fixedAmount ?? null,
    currency: input.currency.trim().toUpperCase(),
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function calculateDiscountAmount(
  discount: Discount,
  subtotal: number,
): number {
  if (!discount.active) {
    return 0;
  }

  if (discount.percentage != null) {
    return Number(((subtotal * discount.percentage) / 100).toFixed(2));
  }

  return Number((discount.fixedAmount ?? 0).toFixed(2));
}
