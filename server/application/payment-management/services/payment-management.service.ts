/**
 * Payment Management — payment lifecycle only.
 *
 * Reads orders via IOrderPaymentReader only.
 * Does NOT access Order Repository, Checkout, Cart, or Product BCM directly.
 */
import type { IOrderPaymentReader } from "@server/application/payment-management/contracts/order-payment-reader.contract";
import type { IPaymentEventPublisher } from "@server/application/payment-management/contracts/payment-event-publisher.contract";
import type { IPaymentGateway } from "@server/application/payment-management/contracts/payment-gateway.contract";
import type { IPaymentHistoryRepository } from "@server/application/payment-management/contracts/payment-history-repository.contract";
import type { IPaymentRepository } from "@server/application/payment-management/contracts/payment-repository.contract";
import type { IPaymentStatusProvider } from "@server/application/payment-management/contracts/payment-status-provider.contract";
import {
  createPaymentHistoryEntry,
  type CancelPaymentResult,
  type ConfirmPaymentResult,
  type FailPaymentResult,
  type PaymentHistoryView,
} from "@server/application/payment-management/models/payment-history.model";
import {
  createPayment,
  PaymentStatus,
  type Payment,
  withGatewayReference,
  withPaymentStatus,
} from "@server/application/payment-management/models/payment.model";
import type { IIdGenerator } from "@server/application/ports";

export class PaymentManagementService {
  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderReader: IOrderPaymentReader,
    private readonly paymentGateway: IPaymentGateway,
    private readonly statusProvider: IPaymentStatusProvider,
    private readonly historyRepository: IPaymentHistoryRepository,
    private readonly eventPublisher: IPaymentEventPublisher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createPayment(customerId: string, orderId: string): Promise<Payment> {
    const order = await this.requirePayableOrder(orderId, customerId);

    const existing = await this.paymentRepository.findByOrderId(orderId);
    const activePayment = existing.find((payment) => !this.statusProvider.isTerminal(payment.status));
    if (activePayment) {
      throw new Error(`Active payment already exists for order: ${orderId}`);
    }

    const paymentId = this.idGenerator.generate();
    let payment = createPayment({
      paymentId,
      orderId,
      customerId,
      amount: order.subtotal,
      currency: order.currency,
    });

    const gatewayResult = await this.paymentGateway.initiate({
      paymentId,
      orderId,
      customerId,
      amount: order.subtotal,
      currency: order.currency,
    });

    payment = withGatewayReference(payment, gatewayResult.gatewayReference);
    if (gatewayResult.status === "processing") {
      payment = withPaymentStatus(payment, PaymentStatus.Processing);
    }

    await this.paymentRepository.save(payment);
    await this.recordHistory(
      paymentId,
      payment.status,
      null,
      "Payment created",
      customerId,
    );
    await this.eventPublisher.publishPaymentCreated(paymentId, orderId, customerId);

    return payment;
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.paymentRepository.findById(paymentId);
  }

  async getAllPayments(): Promise<readonly Payment[]> {
    return this.paymentRepository.findAll();
  }

  async getPaymentsByOrderId(orderId: string): Promise<readonly Payment[]> {
    return this.paymentRepository.findByOrderId(orderId);
  }

  async confirmPayment(paymentId: string): Promise<ConfirmPaymentResult> {
    const payment = await this.requirePayment(paymentId);

    if (payment.status === PaymentStatus.Succeeded) {
      return { confirmed: true, paymentId, status: payment.status };
    }

    if (!payment.gatewayReference) {
      throw new Error("Payment has no gateway reference.");
    }

    const gatewayResult = await this.paymentGateway.confirm(payment.gatewayReference);
    if (gatewayResult.status !== "succeeded") {
      throw new Error(gatewayResult.message ?? "Payment confirmation failed.");
    }

    const updated = await this.transitionPayment(
      payment,
      PaymentStatus.Succeeded,
      "Payment confirmed",
      null,
    );
    await this.eventPublisher.publishPaymentSucceeded(paymentId, payment.orderId);

    return { confirmed: true, paymentId, status: updated.status };
  }

  async failPayment(paymentId: string, reason?: string): Promise<FailPaymentResult> {
    const payment = await this.requirePayment(paymentId);

    if (payment.status === PaymentStatus.Failed) {
      return { failed: true };
    }

    if (this.statusProvider.isTerminal(payment.status)) {
      throw new Error(`Payment cannot fail in status: ${payment.status}`);
    }

    if (payment.gatewayReference) {
      await this.paymentGateway.fail(payment.gatewayReference, reason);
    }

    await this.transitionPayment(
      payment,
      PaymentStatus.Failed,
      reason ?? "Payment failed",
      null,
    );
    await this.eventPublisher.publishPaymentFailed(paymentId, payment.orderId, reason);

    return { failed: true };
  }

  async cancelPayment(paymentId: string, customerId: string, reason?: string): Promise<CancelPaymentResult> {
    const payment = await this.requirePayment(paymentId);

    if (payment.customerId !== customerId.trim()) {
      return { cancelled: false };
    }

    if (payment.status === PaymentStatus.Cancelled) {
      return { cancelled: true };
    }

    if (this.statusProvider.isTerminal(payment.status)) {
      throw new Error(`Payment cannot be cancelled in status: ${payment.status}`);
    }

    if (payment.gatewayReference) {
      await this.paymentGateway.cancel(payment.gatewayReference);
    }

    await this.transitionPayment(
      payment,
      PaymentStatus.Cancelled,
      reason ?? "Payment cancelled",
      customerId,
    );
    await this.eventPublisher.publishPaymentCancelled(paymentId, payment.orderId);

    return { cancelled: true };
  }

  async getPaymentHistory(paymentId: string): Promise<PaymentHistoryView> {
    await this.requirePayment(paymentId);
    const entries = await this.historyRepository.findByPaymentId(paymentId);
    return { paymentId, entries };
  }

  private async requirePayableOrder(orderId: string, customerId: string) {
    const order = await this.orderReader.getOrderForPayment(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    if (order.customerId !== customerId.trim()) {
      throw new Error("Order does not belong to customer.");
    }
    if (!order.payable) {
      throw new Error(`Order is not payable in status: ${order.status}`);
    }
    return order;
  }

  private async requirePayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }
    return payment;
  }

  private async transitionPayment(
    payment: Payment,
    status: PaymentStatus,
    reason: string,
    actor: string | null,
  ): Promise<Payment> {
    if (!this.statusProvider.canTransition(payment.status, status)) {
      throw new Error(`Invalid payment status transition: ${payment.status} -> ${status}`);
    }

    const updated = withPaymentStatus(payment, status);
    await this.paymentRepository.update(updated);
    await this.recordHistory(payment.paymentId, status, payment.status, reason, actor);
    await this.eventPublisher.publishStatusChanged(payment.paymentId, status, payment.status);

    return updated;
  }

  private async recordHistory(
    paymentId: string,
    status: PaymentStatus,
    previousStatus: PaymentStatus | null,
    reason: string,
    actor: string | null,
  ): Promise<void> {
    await this.historyRepository.append(
      createPaymentHistoryEntry({
        id: this.idGenerator.generate(),
        paymentId,
        status,
        previousStatus,
        reason,
        actor,
      }),
    );
  }
}

export { isPaymentStatus } from "@server/application/payment-management/models/payment.model";
