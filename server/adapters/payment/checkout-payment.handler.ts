import type { OrderDTO, PaymentMethod } from "@shared/contracts/order";
import type {
  CheckoutPaymentResult,
  ICheckoutPaymentHandler,
} from "@server/ports/checkout-payment.port";
import type { IPaymentProvider } from "@server/ports/payment.provider";

/**
 * Resolves checkout payment by method.
 * ONLINE: architecture ready for IPaymentProvider, Finik not invoked yet.
 * CASH: marks order as unpaid, no external payment URL.
 */
export class CheckoutPaymentHandler implements ICheckoutPaymentHandler {
  constructor(private readonly paymentProvider: IPaymentProvider) {}

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

    // ONLINE — provider hook reserved; Finik integration deferred.
    void this.paymentProvider;
    void order;
    void idempotencyKey;

    return {
      paymentUrl: null,
      paymentStatus: "awaiting",
    };
  }
}
