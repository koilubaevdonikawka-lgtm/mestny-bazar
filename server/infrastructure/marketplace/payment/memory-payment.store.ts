import type { IPaymentStore } from "@server/application/modules/payment/payment/contracts";
import type { Payment } from "@server/application/modules/payment/payment/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory payment store for development and tests. */
export class MemoryPaymentStore implements IPaymentStore {
  private readonly byId = new InMemoryStore<Payment>((payment) => payment.id);
  private readonly byOrderId = new Map<string, string>();
  private readonly byProviderPaymentId = new Map<string, string>();

  async savePayment(payment: Payment): Promise<void> {
    this.byId.set(payment);
    this.byOrderId.set(payment.orderId, payment.id);
    this.byProviderPaymentId.set(payment.providerPaymentId, payment.id);
  }

  async updatePayment(payment: Payment): Promise<void> {
    if (!(await this.findById(payment.id))) {
      throw new Error(`Payment not found: ${payment.id}`);
    }
    await this.savePayment(payment);
  }

  async findById(paymentId: string): Promise<Payment | null> {
    return this.byId.get(paymentId) ?? null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const id = this.byOrderId.get(orderId);
    return id ? this.findById(id) : null;
  }

  async findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    const id = this.byProviderPaymentId.get(providerPaymentId);
    return id ? this.findById(id) : null;
  }
}
