import type { PaymentManagementApplicationService } from "@server/application/payment-management/services/payment-management-application.service";
import type { PaymentManagementService } from "@server/application/payment-management/services/payment-management.service";
import type {
  CreatePaymentWorkflowResult,
  IPaymentWorkflowService,
  PaymentWorkflowSnapshot,
} from "@server/application/workflow-orchestration/contracts/payment-workflow-service.contract";

/** Adapts Payment Management Application Service to IPaymentWorkflowService. */
export class PaymentWorkflowServiceAdapter implements IPaymentWorkflowService {
  constructor(
    private readonly payments: PaymentManagementApplicationService,
    private readonly paymentService: PaymentManagementService,
  ) {}

  async createForOrder(
    customerId: string,
    orderId: string,
  ): Promise<CreatePaymentWorkflowResult> {
    const result = await this.payments.createPayment(customerId, orderId);
    const payment = result.value;
    return Object.freeze({
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      status: payment.status,
    });
  }

  async confirmPayment(paymentId: string): Promise<boolean> {
    const result = await this.payments.confirmPayment(paymentId);
    return result.value.confirmed;
  }

  async failPayment(paymentId: string, reason?: string): Promise<boolean> {
    const result = await this.payments.failPayment(paymentId, reason);
    return result.value.failed;
  }

  async cancelPayment(
    paymentId: string,
    customerId: string,
    reason?: string,
  ): Promise<boolean> {
    const result = await this.payments.cancelPayment(paymentId, customerId, reason);
    return result.value.cancelled;
  }

  async getPayment(paymentId: string): Promise<PaymentWorkflowSnapshot | null> {
    const result = await this.payments.getPayment(paymentId);
    const payment = result.value;
    if (!payment) {
      return null;
    }

    return toSnapshot(payment);
  }

  async findByOrderId(orderId: string): Promise<PaymentWorkflowSnapshot | null> {
    const payments = await this.paymentService.getPaymentsByOrderId(orderId);
    const payment = payments[0];
    return payment ? toSnapshot(payment) : null;
  }
}

function toSnapshot(payment: {
  paymentId: string;
  orderId: string;
  customerId: string;
  status: string;
}): PaymentWorkflowSnapshot {
  return Object.freeze({
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    customerId: payment.customerId,
    status: payment.status,
  });
}
