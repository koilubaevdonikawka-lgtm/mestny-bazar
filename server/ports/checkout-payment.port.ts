import type { OrderDTO, PaymentMethod, PaymentStatus } from "@shared/contracts/order";

export interface CheckoutPaymentResult {
  paymentUrl: string | null;
  paymentStatus: PaymentStatus;
}

/** Prepares payment outcome per method without coupling checkout to a specific provider. */
export interface ICheckoutPaymentHandler {
  preparePayment(
    method: PaymentMethod,
    order: OrderDTO,
    idempotencyKey: string,
  ): Promise<CheckoutPaymentResult>;
}
