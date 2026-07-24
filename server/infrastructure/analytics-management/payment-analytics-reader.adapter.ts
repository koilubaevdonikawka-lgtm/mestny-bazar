import { PaymentStatus } from "@server/application/payment-management/models/payment.model";
import type { PaymentManagementService } from "@server/application/payment-management/services/payment-management.service";
import type {
  IPaymentAnalyticsReader,
  PaymentAnalyticsRecord,
  PaymentAnalyticsSnapshot,
} from "@server/application/analytics-management/contracts/payment-analytics-reader.contract";

/** Adapts Payment Management to IPaymentAnalyticsReader — no Payment Repository access. */
export class PaymentAnalyticsReaderAdapter implements IPaymentAnalyticsReader {
  constructor(private readonly payments: PaymentManagementService) {}

  async getPaymentSnapshot(): Promise<PaymentAnalyticsSnapshot> {
    const payments = await this.payments.getAllPayments();
    const records: PaymentAnalyticsRecord[] = payments.map((payment) =>
      Object.freeze({
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        customerId: payment.customerId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
      }),
    );

    const paymentsByStatus: Record<string, number> = {};
    let totalAmount = 0;
    let succeededAmount = 0;
    let currency: string | null = null;

    for (const payment of payments) {
      paymentsByStatus[payment.status] = (paymentsByStatus[payment.status] ?? 0) + 1;
      totalAmount += payment.amount;
      if (payment.status === PaymentStatus.Succeeded) {
        succeededAmount += payment.amount;
      }
      currency ??= payment.currency;
    }

    return Object.freeze({
      totalPayments: payments.length,
      totalAmount,
      succeededAmount,
      currency,
      paymentsByStatus: Object.freeze(paymentsByStatus),
      records: Object.freeze(records),
    });
  }
}
