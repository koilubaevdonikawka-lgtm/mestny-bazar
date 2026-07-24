import type { PaymentHistoryEntry } from "@server/application/payment-management/models/payment-history.model";

export interface IPaymentHistoryRepository {
  append(entry: PaymentHistoryEntry): Promise<void>;
  findByPaymentId(paymentId: string): Promise<readonly PaymentHistoryEntry[]>;
}
