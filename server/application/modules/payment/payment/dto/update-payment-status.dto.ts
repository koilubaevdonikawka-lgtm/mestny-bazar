import type { PaymentStatusValue } from "@server/application/modules/payment/payment/models";

export interface UpdatePaymentStatusDto {
  readonly paymentId: string;
  readonly status: PaymentStatusValue;
}
