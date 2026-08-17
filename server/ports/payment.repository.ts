import type {
  PaymentEventType,
  PaymentRecordDTO,
  PaymentRecordStatus,
} from "@shared/contracts/payment";

export interface CreatePaymentRecordInput {
  orderId: string;
  provider: string;
  idempotencyKey: string;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  paymentUrl: string | null;
  providerPaymentId: string | null;
  expiresAt: string | null;
}

/** Payment records + payment audit log (payment_events folds into this one repository, mirroring how IOrderRepository owns both orders and line items). */
export interface IPaymentRepository {
  create(input: CreatePaymentRecordInput): Promise<PaymentRecordDTO>;
  getById(id: string): Promise<PaymentRecordDTO | null>;
  getByOrderId(orderId: string): Promise<PaymentRecordDTO | null>;
  getByIdempotencyKey(idempotencyKey: string): Promise<PaymentRecordDTO | null>;
  getByProviderPaymentId(providerPaymentId: string): Promise<PaymentRecordDTO | null>;
  updateStatus(
    id: string,
    status: PaymentRecordStatus,
    fields?: { failureReason?: string | null },
  ): Promise<PaymentRecordDTO>;
  markProviderPaymentId(id: string, providerPaymentId: string): Promise<PaymentRecordDTO>;
  logEvent(
    paymentId: string,
    eventType: PaymentEventType,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  /** Every payment still `pending`/`awaiting` whose `expiresAt` is already in the past — the sweep target for `PaymentService.checkExpiry`. */
  listExpiredPending(): Promise<PaymentRecordDTO[]>;
}
