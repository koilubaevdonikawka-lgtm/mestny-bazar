import type { PaymentModule } from "@server/application/modules/payment/payment/api/payment.module";
import {
  isSuccessfulPaymentStatus,
  PaymentStatus,
} from "@server/application/modules/payment/payment/models";
import { normalizePaymentMethod } from "@server/application/modules/payment/payment/models/payment-method.model";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { PayOrderInput, PayOrderResult } from "@server/application/purchase/dto";

/** Process order payment — cash confirmation or online payment URL via Payment BCM. */
export class PayOrderUseCase {
  constructor(private readonly payments: PaymentModule) {}

  async execute(input: PayOrderInput): Promise<UseCaseResult<PayOrderResult>> {
    const paymentId = input.paymentId.trim();
    const payment = await this.payments.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    const method = normalizePaymentMethod(payment.method);
    if (method === "cash") {
      if (input.confirmCash === false) {
        return useCaseResult(
          Object.freeze({
            payment,
            requiresOnlinePayment: false,
            paymentUrl: null,
          }),
        );
      }

      if (!isSuccessfulPaymentStatus(payment.status)) {
        const updated = await this.payments.updatePaymentStatus({
          paymentId: payment.id,
          status: PaymentStatus.Succeeded,
        });

        return useCaseResult(
          Object.freeze({
            payment: updated,
            requiresOnlinePayment: false,
            paymentUrl: null,
          }),
        );
      }
    }

    if (isSuccessfulPaymentStatus(payment.status)) {
      return useCaseResult(
        Object.freeze({
          payment,
          requiresOnlinePayment: false,
          paymentUrl: payment.paymentUrl,
        }),
      );
    }

    return useCaseResult(
      Object.freeze({
        payment,
        requiresOnlinePayment: true,
        paymentUrl: payment.paymentUrl,
      }),
    );
  }
}
