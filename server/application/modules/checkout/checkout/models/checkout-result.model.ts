import type { OrderReadModel } from "@server/domain/order";
import type { PaymentReference } from "@server/application/modules/checkout/checkout/contracts";
import type { CheckoutSession } from "@server/application/modules/checkout/checkout/models/checkout-session.model";

/** Result of a completed checkout business process. */
export interface CheckoutResult {
  readonly session: CheckoutSession;
  readonly order: OrderReadModel;
  readonly payment: PaymentReference;
}

export function createCheckoutResult(input: CheckoutResult): CheckoutResult {
  return Object.freeze({ ...input });
}
