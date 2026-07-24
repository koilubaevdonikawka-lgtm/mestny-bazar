import type { Payment } from "@server/application/payment-management/models/payment.model";
import type {
  CancelPaymentResult,
  ConfirmPaymentResult,
  FailPaymentResult,
  PaymentHistoryView,
} from "@server/application/payment-management/models/payment-history.model";
import type { PaymentManagementService } from "@server/application/payment-management/services/payment-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreatePaymentUseCase {
  constructor(private readonly payments: PaymentManagementService) {}

  execute(customerId: string, orderId: string): Promise<UseCaseResult<Payment>> {
    return this.payments.createPayment(customerId, orderId).then(useCaseResult);
  }
}

export class GetPaymentUseCase {
  constructor(private readonly payments: PaymentManagementService) {}

  async execute(paymentId: string): Promise<UseCaseResult<Payment | null>> {
    return useCaseResult(await this.payments.getPayment(paymentId));
  }
}

export class ConfirmPaymentUseCase {
  constructor(private readonly payments: PaymentManagementService) {}

  execute(paymentId: string): Promise<UseCaseResult<ConfirmPaymentResult>> {
    return this.payments.confirmPayment(paymentId).then(useCaseResult);
  }
}

export class FailPaymentUseCase {
  constructor(private readonly payments: PaymentManagementService) {}

  execute(paymentId: string, reason?: string): Promise<UseCaseResult<FailPaymentResult>> {
    return this.payments.failPayment(paymentId, reason).then(useCaseResult);
  }
}

export class CancelPaymentUseCase {
  constructor(private readonly payments: PaymentManagementService) {}

  execute(
    paymentId: string,
    customerId: string,
    reason?: string,
  ): Promise<UseCaseResult<CancelPaymentResult>> {
    return this.payments.cancelPayment(paymentId, customerId, reason).then(useCaseResult);
  }
}

export class GetPaymentHistoryUseCase {
  constructor(private readonly payments: PaymentManagementService) {}

  execute(paymentId: string): Promise<UseCaseResult<PaymentHistoryView>> {
    return this.payments.getPaymentHistory(paymentId).then(useCaseResult);
  }
}
