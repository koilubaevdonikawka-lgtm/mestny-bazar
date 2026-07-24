import type { IPaymentGateway, IPaymentStore } from "@server/application/modules/payment/payment/contracts";
import type { CreatePaymentDto, UpdatePaymentStatusDto } from "@server/application/modules/payment/payment/dto";
import {
  createPaymentCreatedEvent,
  createPaymentFailedEvent,
  createPaymentSucceededEvent,
} from "@server/application/modules/payment/payment/events";
import {
  assertPaymentStatus,
  createPayment,
  isFailedPaymentStatus,
  isSuccessfulPaymentStatus,
  mapGatewayStatusToPaymentStatus,
  type Payment,
  withPaymentStatus,
} from "@server/application/modules/payment/payment/models";
import type { IIdGenerator } from "@server/application/ports";

/** Payment business capability service — orchestrates payment lifecycle via IPaymentStore and IPaymentGateway. */
export class PaymentService {
  constructor(
    private readonly store: IPaymentStore,
    private readonly gateway: IPaymentGateway,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    validateCreatePaymentDto(dto);

    const paymentId = this.idGenerator.generate();
    const idempotencyKey = dto.idempotencyKey?.trim() || `payment-${dto.orderId}-${paymentId}`;

    const gatewayResponse = await this.gateway.createPayment({
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency,
      method: dto.method,
      idempotencyKey,
      description: dto.description,
      customerPhone: dto.customerPhone,
      metadata: dto.metadata,
    });

    const payment = createPayment({
      id: paymentId,
      orderId: dto.orderId,
      providerPaymentId: gatewayResponse.providerPaymentId,
      method: dto.method,
      status: mapGatewayStatusToPaymentStatus(gatewayResponse.status),
      amount: gatewayResponse.amount,
      currency: gatewayResponse.currency,
      paymentUrl: gatewayResponse.paymentUrl,
      idempotencyKey,
    });

    await this.store.savePayment(payment);
    this.emitLifecycleEvents(payment);

    return payment;
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.store.findById(paymentId.trim());
  }

  async updatePaymentStatus(dto: UpdatePaymentStatusDto): Promise<Payment> {
    const paymentId = dto.paymentId.trim();
    const nextStatus = assertPaymentStatus(dto.status);

    const existing = await this.store.findById(paymentId);
    if (!existing) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    if (existing.status === nextStatus) {
      return existing;
    }

    const updated = withPaymentStatus(existing, nextStatus);
    await this.store.updatePayment(updated);
    this.emitLifecycleEvents(updated, existing.status);

    return updated;
  }

  private emitLifecycleEvents(payment: Payment, previousStatus?: Payment["status"]): void {
    const isStatusChange = previousStatus !== undefined && previousStatus !== payment.status;

    if (!isStatusChange) {
      createPaymentCreatedEvent({
        paymentId: payment.id,
        orderId: payment.orderId,
        providerPaymentId: payment.providerPaymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    if (isSuccessfulPaymentStatus(payment.status)) {
      createPaymentSucceededEvent({
        paymentId: payment.id,
        orderId: payment.orderId,
        providerPaymentId: payment.providerPaymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      });
      return;
    }

    if (isFailedPaymentStatus(payment.status)) {
      createPaymentFailedEvent({
        paymentId: payment.id,
        orderId: payment.orderId,
        providerPaymentId: payment.providerPaymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      });
    }
  }
}

function validateCreatePaymentDto(dto: CreatePaymentDto): void {
  if (!dto.orderId?.trim()) {
    throw new Error("Order id is required.");
  }
  if (!Number.isFinite(dto.amount) || dto.amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }
  if (!dto.currency?.trim()) {
    throw new Error("Payment currency is required.");
  }
  if (!dto.method?.trim()) {
    throw new Error("Payment method is required.");
  }
}
