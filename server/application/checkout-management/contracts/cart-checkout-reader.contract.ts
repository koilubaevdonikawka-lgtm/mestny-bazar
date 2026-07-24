import type {
  CartTotalResult,
  CartValidationResult,
  CartView,
} from "@server/application/cart-management/models/cart-view.model";

/**
 * Read-only cart access for checkout.
 * Implemented by an adapter over Cart Management — no Cart BCM access.
 */
export interface ICartCheckoutReader {
  getCart(customerId: string): Promise<CartView>;
  validateCart(customerId: string): Promise<CartValidationResult>;
  calculateTotal(customerId: string): Promise<CartTotalResult>;
}
