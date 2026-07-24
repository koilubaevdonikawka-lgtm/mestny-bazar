import type { CheckoutSession } from "@server/application/modules/checkout/checkout/models";

/** Checkout session persistence contract — internal to the checkout process module. */
export interface ICheckoutSessionStore {
  save(session: CheckoutSession): Promise<void>;
  findById(sessionId: string): Promise<CheckoutSession | null>;
}
