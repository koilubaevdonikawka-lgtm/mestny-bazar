import type { IPaymentRepository } from "@server/application/payment-management/contracts/payment-repository.contract";
import type { Payment } from "@server/application/payment-management/models/payment.model";

/** In-memory payment store. */
export class PaymentRepository implements IPaymentRepository {
  private readonly payments = new Map<string, Payment>();
  private readonly paymentsByOrder = new Map<string, Set<string>>();

  async save(payment: Payment): Promise<void> {
    this.payments.set(payment.paymentId, payment);
    const orderPayments = this.paymentsByOrder.get(payment.orderId) ?? new Set();
    orderPayments.add(payment.paymentId);
    this.paymentsByOrder.set(payment.orderId, orderPayments);
  }

  async findById(paymentId: string): Promise<Payment | null> {
    return this.payments.get(paymentId.trim()) ?? null;
  }

  async findByOrderId(orderId: string): Promise<readonly Payment[]> {
    const ids = this.paymentsByOrder.get(orderId.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.payments.get(id))
        .filter((payment): payment is Payment => payment !== undefined)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findAll(): Promise<readonly Payment[]> {
    return Object.freeze(
      [...this.payments.values()].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
  }

  async update(payment: Payment): Promise<void> {
    if (!(await this.findById(payment.paymentId))) {
      throw new Error(`Payment not found: ${payment.paymentId}`);
    }
    this.payments.set(payment.paymentId, payment);
  }
}
