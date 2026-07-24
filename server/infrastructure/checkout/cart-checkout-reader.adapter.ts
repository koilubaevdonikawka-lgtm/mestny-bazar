import type { CartManagementApplicationService } from "@server/application/cart-management/services/cart-management-application.service";
import type { ICartCheckoutReader } from "@server/application/checkout-management/contracts/cart-checkout-reader.contract";

/** Adapts Cart Management to ICartCheckoutReader — no Cart BCM access. */
export class CartCheckoutReaderAdapter implements ICartCheckoutReader {
  constructor(private readonly cart: CartManagementApplicationService) {}

  async getCart(customerId: string) {
    const result = await this.cart.getCart(customerId);
    return result.value;
  }

  async validateCart(customerId: string) {
    const result = await this.cart.validate(customerId);
    return result.value;
  }

  async calculateTotal(customerId: string) {
    const result = await this.cart.calculateTotal(customerId);
    return result.value;
  }
}
