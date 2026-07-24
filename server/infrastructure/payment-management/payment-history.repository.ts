import type { IPaymentHistoryRepository } from "@server/application/payment-management/contracts/payment-history-repository.contract";
import type { PaymentHistoryEntry } from "@server/application/payment-management/models/payment-history.model";

/** In-memory payment history store. */
export class PaymentHistoryRepository implements IPaymentHistoryRepository {
  private readonly entriesByPayment = new Map<string, PaymentHistoryEntry[]>();

  async append(entry: PaymentHistoryEntry): Promise<void> {
    const entries = this.entriesByPayment.get(entry.paymentId) ?? [];
    entries.push(entry);
    this.entriesByPayment.set(entry.paymentId, entries);
  }

  async findByPaymentId(paymentId: string): Promise<readonly PaymentHistoryEntry[]> {
    const entries = this.entriesByPayment.get(paymentId.trim()) ?? [];
    return Object.freeze(
      [...entries].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt)),
    );
  }
}
