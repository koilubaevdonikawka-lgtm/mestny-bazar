import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import type { Customer, CustomerAddress } from "@server/application/modules/customer/customer/models";
import type { OrderReadModel } from "@server/domain/order";
import type { PaymentReference } from "@server/application/modules/checkout/checkout/contracts";
import type { CheckoutCartLine } from "@server/application/modules/checkout/checkout/models/checkout-cart-line.model";
import type { CheckoutSession } from "@server/application/modules/checkout/checkout/models/checkout-session.model";
import type { PriceCalculation } from "@server/application/modules/pricing/pricing/models";
import { sumPriceCalculations } from "@server/application/modules/pricing/pricing/models";

/** Transient orchestration context for the checkout business process. */
export interface CheckoutContext {
  readonly session: CheckoutSession;
  customer?: Customer;
  defaultAddress?: CustomerAddress | null;
  cart?: CartSnapshot;
  lines?: readonly CheckoutCartLine[];
  priceCalculations?: readonly PriceCalculation[];
  pricingTotals?: {
    readonly subtotal: number;
    readonly discount: number;
    readonly total: number;
    readonly currency: string;
  };
  order?: OrderReadModel;
  payment?: PaymentReference;
}

export function createCheckoutContext(session: CheckoutSession): CheckoutContext {
  return Object.freeze({ session });
}

export function withCheckoutContextCustomer(
  context: CheckoutContext,
  customer: Customer,
  defaultAddress: CustomerAddress | null,
): CheckoutContext {
  return Object.freeze({ ...context, customer, defaultAddress });
}

export function withCheckoutContextCart(
  context: CheckoutContext,
  cart: CartSnapshot,
  lines: readonly CheckoutCartLine[],
): CheckoutContext {
  return Object.freeze({ ...context, cart, lines });
}

export function withCheckoutContextPricing(
  context: CheckoutContext,
  priceCalculations: readonly PriceCalculation[],
): CheckoutContext {
  const pricingTotals = sumPriceCalculations(priceCalculations);
  return Object.freeze({
    ...context,
    priceCalculations: Object.freeze([...priceCalculations]),
    pricingTotals: Object.freeze({
      subtotal: pricingTotals.subtotal,
      discount: pricingTotals.discount,
      total: pricingTotals.total,
      currency: pricingTotals.currency,
    }),
  });
}

export function withCheckoutContextOrder(
  context: CheckoutContext,
  order: OrderReadModel,
): CheckoutContext {
  return Object.freeze({ ...context, order });
}

export function withCheckoutContextPayment(
  context: CheckoutContext,
  payment: PaymentReference,
): CheckoutContext {
  return Object.freeze({ ...context, payment });
}
