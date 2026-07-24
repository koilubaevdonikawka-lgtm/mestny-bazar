import {
  CancelPaymentUseCase,
  ConfirmPaymentUseCase,
  CreatePaymentUseCase,
  FailPaymentUseCase,
  GetPaymentHistoryUseCase,
  GetPaymentUseCase,
} from "@server/application/payment-management/use-cases/payment-management.use-cases";

/** Application facade for payment management scenario. */
export class PaymentManagementApplicationService {
  constructor(
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly getPaymentUseCase: GetPaymentUseCase,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
    private readonly failPaymentUseCase: FailPaymentUseCase,
    private readonly cancelPaymentUseCase: CancelPaymentUseCase,
    private readonly getPaymentHistoryUseCase: GetPaymentHistoryUseCase,
  ) {}

  createPayment(customerId: string, orderId: string) {
    return this.createPaymentUseCase.execute(customerId, orderId);
  }

  getPayment(paymentId: string) {
    return this.getPaymentUseCase.execute(paymentId);
  }

  confirmPayment(paymentId: string) {
    return this.confirmPaymentUseCase.execute(paymentId);
  }

  failPayment(paymentId: string, reason?: string) {
    return this.failPaymentUseCase.execute(paymentId, reason);
  }

  cancelPayment(paymentId: string, customerId: string, reason?: string) {
    return this.cancelPaymentUseCase.execute(paymentId, customerId, reason);
  }

  getHistory(paymentId: string) {
    return this.getPaymentHistoryUseCase.execute(paymentId);
  }
}
