import type { PriceAmount } from "@server/application/modules/pricing/pricing/models/price.model";

/** Price calculation result owned by the Pricing capability module. */
export interface PriceCalculation {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: PriceAmount;
  readonly subtotal: number;
  readonly discountAmount: number;
  readonly promotionAmount: number;
  readonly total: number;
  readonly currency: string;
}

export function createPriceCalculation(input: {
  productId: string;
  quantity: number;
  unitPrice: PriceAmount;
  discountAmount?: number;
  promotionAmount?: number;
}): PriceCalculation {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new Error("Price calculation quantity must be a positive integer.");
  }

  const subtotal = Number((input.unitPrice.amount * input.quantity).toFixed(2));
  const discountAmount = Number((input.discountAmount ?? 0).toFixed(2));
  const promotionAmount = Number((input.promotionAmount ?? 0).toFixed(2));
  const total = Number((subtotal - discountAmount - promotionAmount).toFixed(2));

  if (total < 0) {
    throw new Error("Calculated price total cannot be negative.");
  }

  return Object.freeze({
    productId: input.productId.trim(),
    quantity: input.quantity,
    unitPrice: Object.freeze({ ...input.unitPrice }),
    subtotal,
    discountAmount,
    promotionAmount,
    total,
    currency: input.unitPrice.currency,
  });
}

export function sumPriceCalculations(
  calculations: readonly PriceCalculation[],
): { subtotal: number; discount: number; promotion: number; total: number; currency: string } {
  if (calculations.length === 0) {
    throw new Error("At least one price calculation is required.");
  }

  const currency = calculations[0]!.currency;
  const subtotal = Number(
    calculations.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
  );
  const discount = Number(
    calculations.reduce((sum, item) => sum + item.discountAmount, 0).toFixed(2),
  );
  const promotion = Number(
    calculations.reduce((sum, item) => sum + item.promotionAmount, 0).toFixed(2),
  );
  const total = Number(
    calculations.reduce((sum, item) => sum + item.total, 0).toFixed(2),
  );

  return Object.freeze({ subtotal, discount: discount + promotion, promotion, total, currency });
}
