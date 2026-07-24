import type { CreateCheckoutDto, CheckoutValidationResult } from "@server/application/modules/checkout/checkout/dto";
import type { CheckoutResult, CheckoutSession } from "@server/application/modules/checkout/checkout/models";
import type { CheckoutService } from "@server/application/modules/checkout/checkout/services";

/** Public entry point for the Checkout business process module. */
export class CheckoutModule {
  constructor(private readonly service: CheckoutService) {}

  createCheckout(input: CreateCheckoutDto): Promise<CheckoutSession> {
    return this.service.createCheckout(input);
  }

  validateCheckout(sessionId: string): Promise<CheckoutValidationResult> {
    return this.service.validateCheckout(sessionId);
  }

  placeOrder(sessionId: string): Promise<CheckoutResult> {
    return this.service.placeOrder(sessionId);
  }

  getCheckout(sessionId: string): Promise<CheckoutSession | null> {
    return this.service.getCheckout(sessionId);
  }
}
