export type CheckoutSessionStatus = "draft" | "validated" | "placed" | "expired";

/** Checkout session owned by the checkout process module. */
export interface CheckoutSession {
  readonly id: string;
  readonly customerId: string;
  readonly status: CheckoutSessionStatus;
  readonly paymentMethod: string;
  readonly deliveryMethod: string;
  readonly comment: string | null;
  readonly createdAt: string;
  readonly expiresAt: string;
}

export function createCheckoutSession(input: {
  id: string;
  customerId: string;
  paymentMethod: string;
  deliveryMethod: string;
  comment?: string | null;
  ttlMs?: number;
}): CheckoutSession {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + (input.ttlMs ?? 30 * 60 * 1000));

  return Object.freeze({
    id: input.id,
    customerId: input.customerId,
    status: "draft",
    paymentMethod: input.paymentMethod,
    deliveryMethod: input.deliveryMethod,
    comment: input.comment?.trim() || null,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}

export function withCheckoutSessionStatus(
  session: CheckoutSession,
  status: CheckoutSessionStatus,
): CheckoutSession {
  return Object.freeze({ ...session, status });
}
