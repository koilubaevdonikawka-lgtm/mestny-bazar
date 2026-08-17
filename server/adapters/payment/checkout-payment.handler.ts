import type { OrderDTO, PaymentMethod } from "@shared/contracts/order";
import type {
  CheckoutPaymentResult,
  ICheckoutPaymentHandler,
} from "@server/ports/checkout-payment.port";
import type { PaymentService } from "@server/domain/payment.service";

/**
 * Resolves checkout payment by method (Промпт №075).
 * ONLINE: initiates a real payment via PaymentService/IPaymentProvider —
 * PaymentProviderError propagates as-is, matching checkout.service.ts's
 * documented "preparePayment failures surface as-is" contract.
 * CASH: marks order as unpaid, no external payment URL.
 */
export class CheckoutPaymentHandler implements ICheckoutPaymentHandler {
  constructor(private readonly paymentService: PaymentService) {}

  async preparePayment(
    method: PaymentMethod,
    order: OrderDTO,
    idempotencyKey: string,
  ): Promise<CheckoutPaymentResult> {
    if (method === "CASH") {
      return {
        paymentUrl: null,
        paymentStatus: "unpaid",
      };
    }

    const result = await this.paymentService.initiatePayment(order, idempotencyKey);

    return {
      paymentUrl: result.paymentUrl,
      paymentStatus: result.paymentUrl ? "awaiting" : "failed",
    };
  }
}
