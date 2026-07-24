import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import type { CheckoutContext } from "@server/application/modules/checkout/checkout/models";
import type { CheckoutSession } from "@server/application/modules/checkout/checkout/models";
import type { CheckoutValidationIssue, CheckoutValidationResult } from "@server/application/modules/checkout/checkout/dto";

/** Checkout process policy — validates session and cart prerequisites. */
export class CheckoutPolicy {
  validate(session: CheckoutSession, cart: CartSnapshot, context: CheckoutContext): CheckoutValidationResult {
    const issues: CheckoutValidationIssue[] = [];

    if (session.customerId !== cart.customerId) {
      issues.push({ field: "customerId", message: "Checkout session customer mismatch." });
    }

    if (cart.items.length === 0) {
      issues.push({ field: "cart", message: "Cart must contain at least one item." });
    }

    if (cart.totals.subtotal <= 0) {
      issues.push({ field: "cart", message: "Cart subtotal must be greater than zero." });
    }

    if (!context.customer) {
      issues.push({ field: "customer", message: "Customer profile is required." });
    }

    if (!context.defaultAddress) {
      issues.push({ field: "address", message: "Default delivery address is required." });
    }

    if (context.customer && !context.customer.profile.contact.phone.trim()) {
      issues.push({ field: "phone", message: "Customer phone number is required." });
    }

    if (!session.paymentMethod.trim()) {
      issues.push({ field: "paymentMethod", message: "Payment method is required." });
    }

    if (!session.deliveryMethod.trim()) {
      issues.push({ field: "deliveryMethod", message: "Delivery method is required." });
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      issues.push({ field: "session", message: "Checkout session has expired." });
    }

    return Object.freeze({
      valid: issues.length === 0,
      issues: Object.freeze([...issues]),
    });
  }
}
