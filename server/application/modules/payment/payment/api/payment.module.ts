import type {
  CreatePaymentInput,
  IPaymentModule,
  PaymentReference,
} from "@server/application/modules/checkout/checkout/contracts";
import type { CreatePaymentDto, UpdatePaymentStatusDto } from "@server/application/modules/payment/payment/dto";
import type { Payment } from "@server/application/modules/payment/payment/models";
import type { PaymentService } from "@server/application/modules/payment/payment/services";

/** Public entry point for the Payment business capability module. */
export class PaymentModule implements IPaymentModule {
  constructor(private readonly service: PaymentService) {}

  createPayment(input: CreatePaymentInput): Promise<PaymentReference>;
  createPayment(dto: CreatePaymentDto): Promise<Payment>;
  createPayment(
    input: CreatePaymentInput | CreatePaymentDto,
  ): Promise<PaymentReference | Payment> {
    const paymentPromise = this.service.createPayment(toCreatePaymentDto(input));

    if (isCheckoutPaymentInput(input)) {
      return paymentPromise.then(toPaymentReference);
    }

    return paymentPromise;
  }

  getPayment(paymentId: string): Promise<Payment | null> {
    return this.service.getPayment(paymentId);
  }

  updatePaymentStatus(dto: UpdatePaymentStatusDto): Promise<Payment> {
    return this.service.updatePaymentStatus(dto);
  }
}

function isCheckoutPaymentInput(
  input: CreatePaymentInput | CreatePaymentDto,
): input is CreatePaymentInput {
  return (
    !("idempotencyKey" in input) &&
    !("description" in input) &&
    !("customerPhone" in input) &&
    !("metadata" in input)
  );
}

function toCreatePaymentDto(input: CreatePaymentInput | CreatePaymentDto): CreatePaymentDto {
  return Object.freeze({
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    method: input.method,
    idempotencyKey: "idempotencyKey" in input ? input.idempotencyKey : undefined,
    description: "description" in input ? input.description : undefined,
    customerPhone: "customerPhone" in input ? input.customerPhone : undefined,
    metadata: "metadata" in input ? input.metadata : undefined,
  });
}

function toPaymentReference(payment: Payment): PaymentReference {
  return Object.freeze({
    paymentId: payment.id,
    status: payment.status.toLowerCase(),
    amount: payment.amount,
    currency: payment.currency,
  });
}
