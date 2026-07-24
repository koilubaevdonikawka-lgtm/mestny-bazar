import type { CheckoutManagementApplicationService } from "@server/application/checkout-management/services/checkout-management-application.service";
import type { ICheckoutOrderReader } from "@server/application/order-management/contracts/checkout-order-reader.contract";

/** Adapts Checkout Management to ICheckoutOrderReader — no Checkout Repository access. */
export class CheckoutOrderReaderAdapter implements ICheckoutOrderReader {
  constructor(private readonly checkout: CheckoutManagementApplicationService) {}

  async getCheckoutSummary(checkoutId: string) {
    const result = await this.checkout.getSummary(checkoutId);
    return result.value;
  }

  async validateCheckout(customerId: string, checkoutId: string) {
    const result = await this.checkout.validate(customerId, checkoutId);
    return result.value;
  }
}
