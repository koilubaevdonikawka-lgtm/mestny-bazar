import type { PaymentService } from "@server/application/modules/payment/payment/services";
import type { CreatePaymentDto, UpdatePaymentStatusDto } from "@server/application/modules/payment/payment/dto";
import type { Payment } from "@server/application/modules/payment/payment/models";
import { isSuccessfulPaymentStatus } from "@server/application/modules/payment/payment/models";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Event publishing decorator for PaymentService — infrastructure wiring only. */
export class EventPublishingPaymentService
  implements Pick<PaymentService, "createPayment" | "getPayment" | "updatePaymentStatus">
{
  constructor(
    private readonly inner: PaymentService,
    private readonly publisher: CapabilityEventPublisher,
  ) {}

  createPayment(dto: CreatePaymentDto): Promise<Payment> {
    return this.inner.createPayment(dto).then(async (payment) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.PaymentCreated,
        aggregateId: payment.id,
        aggregateType: "Payment",
        payload: {
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        },
      });

      if (isSuccessfulPaymentStatus(payment.status)) {
        await this.publisher.publish({
          eventName: AnalyticsCapabilityEventName.PaymentSucceeded,
          aggregateId: payment.id,
          aggregateType: "Payment",
          payload: {
            paymentId: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
          },
        });
      }

      return payment;
    });
  }

  getPayment(paymentId: string): Promise<Payment | null> {
    return this.inner.getPayment(paymentId);
  }

  updatePaymentStatus(dto: UpdatePaymentStatusDto): Promise<Payment> {
    return this.inner.updatePaymentStatus(dto).then(async (payment) => {
      if (isSuccessfulPaymentStatus(payment.status)) {
        await this.publisher.publish({
          eventName: AnalyticsCapabilityEventName.PaymentSucceeded,
          aggregateId: payment.id,
          aggregateType: "Payment",
          payload: {
            paymentId: payment.id,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
          },
        });
      }
      return payment;
    });
  }
}

export function asPaymentService(wrapper: EventPublishingPaymentService): PaymentService {
  return wrapper as unknown as PaymentService;
}
