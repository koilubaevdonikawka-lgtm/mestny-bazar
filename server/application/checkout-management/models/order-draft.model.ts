/** Checkout lifecycle status — Order Draft only, no payment. */
export const CheckoutStatus = {
  Draft: "Draft",
  Cancelled: "Cancelled",
} as const;

export type CheckoutStatus = (typeof CheckoutStatus)[keyof typeof CheckoutStatus];

/** Single line in an Order Draft. */
export interface CheckoutLineDraft {
  readonly productId: string;
  readonly sellerId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly currency: string;
  readonly lineTotal: number;
}

/** Order Draft created by Checkout Management — not a paid order. */
export interface OrderDraft {
  readonly checkoutId: string;
  readonly customerId: string;
  readonly status: CheckoutStatus;
  readonly lines: readonly CheckoutLineDraft[];
  readonly subtotal: number;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createOrderDraft(input: {
  checkoutId: string;
  customerId: string;
  lines: readonly CheckoutLineDraft[];
  subtotal: number;
  currency: string;
}): OrderDraft {
  const now = new Date().toISOString();
  return Object.freeze({
    checkoutId: input.checkoutId,
    customerId: input.customerId.trim(),
    status: CheckoutStatus.Draft,
    lines: Object.freeze([...input.lines]),
    subtotal: input.subtotal,
    currency: input.currency,
    createdAt: now,
    updatedAt: now,
  });
}

export function withUpdatedOrderDraft(
  draft: OrderDraft,
  lines: readonly CheckoutLineDraft[],
  subtotal: number,
  currency: string,
): OrderDraft {
  return Object.freeze({
    ...draft,
    lines: Object.freeze([...lines]),
    subtotal,
    currency,
    updatedAt: new Date().toISOString(),
  });
}

export function withCancelledOrderDraft(draft: OrderDraft): OrderDraft {
  return Object.freeze({
    ...draft,
    status: CheckoutStatus.Cancelled,
    updatedAt: new Date().toISOString(),
  });
}
