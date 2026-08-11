import type { IPaymentRepository } from "@server/ports/payment.repository";
import type { IPaymentProvider } from "@server/ports/payment.provider";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderService } from "@server/domain/order.service";
import type { OrderDTO } from "@shared/contracts/order";
import type { PaymentRecordDTO } from "@shared/contracts/payment";
import { withRetry } from "@shared/lib/with-retry";
import { PaymentNotFoundError, PaymentProviderError } from "@server/domain/payment.errors";
import { logger } from "@shared/observability/logger";

const PAYMENT_RETRY_OPTIONS = { attempts: 3, delayMs: 500 };
const PAYMENT_EXPIRY_MS = 30 * 60 * 1000;

export interface InitiatePaymentResult {
  paymentUrl: string | null;
  paymentId: string;
}

export interface ResolvedWebhookPayload {
  providerPaymentId: string;
  orderId: string;
  status: "paid" | "failed";
}

export interface WebhookOutcome {
  accepted: boolean;
  reason?: "invalid_signature" | "unknown_order";
}

/**
 * Payment orchestration (Промпт №075) — idempotent payment initiation,
 * webhook confirmation with duplicate-delivery protection, and status
 * reconciliation. Never logs secret values; provider identity stays
 * server-side (payments.provider is admin-only, never in a customer DTO).
 */
export class PaymentService {
  constructor(
    private readonly payments: IPaymentRepository,
    private readonly provider: IPaymentProvider,
    private readonly orders: OrderService,
    private readonly events: IMarketplaceEventBus,
    private readonly appUrl: string,
  ) {}

  async initiatePayment(order: OrderDTO, idempotencyKey: string): Promise<InitiatePaymentResult> {
    const existing = await this.payments.getByIdempotencyKey(idempotencyKey);
    if (existing) {
      return { paymentUrl: existing.paymentUrl, paymentId: existing.id };
    }

    const returnUrl = `${this.appUrl}/order-success?orderId=${order.id}&orderNumber=${order.orderNumber}`;

    let intent;
    try {
      intent = await withRetry(
        () =>
          this.provider.createPayment({
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: order.total,
            currency: order.currency,
            idempotencyKey,
            returnUrl,
          }),
        PAYMENT_RETRY_OPTIONS,
      );
    } catch (error) {
      logger.error("payment:initiate-failed", { orderId: order.id, error });
      throw new PaymentProviderError("Failed to create payment with provider");
    }

    let record: PaymentRecordDTO;
    try {
      record = await this.payments.create({
        orderId: order.id,
        provider: "finik",
        idempotencyKey,
        amount: order.total,
        currency: order.currency,
        status: intent.status === "failed" ? "failed" : "awaiting",
        paymentUrl: intent.paymentUrl,
        providerPaymentId: intent.providerPaymentId,
        expiresAt: new Date(Date.now() + PAYMENT_EXPIRY_MS).toISOString(),
      });
    } catch (error) {
      // Provider already created a payment session but the local record
      // failed to persist — no confirmed Finik void/cancel API to call, and
      // no cross-service DB transaction is available here (Supabase JS
      // only). Logged for manual reconciliation, same accepted
      // narrow-window pattern checkout.service.ts documents for stock.
      logger.error("payment:rollback-required", {
        orderId: order.id,
        providerPaymentId: intent.providerPaymentId,
        note: "Local payment record failed to persist after provider created a session. Manual reconciliation may be required.",
      });
      throw error;
    }

    await this.payments.logEvent(record.id, "created", {
      providerPaymentId: intent.providerPaymentId,
    });
    if (record.paymentUrl) await this.payments.logEvent(record.id, "redirect_issued");
    if (record.status === "failed") await this.payments.logEvent(record.id, "failed");

    await this.events.publish({ type: "payment.initiated", order, paymentId: record.id });

    return { paymentUrl: record.paymentUrl, paymentId: record.id };
  }

  /** Signature must be verified before anything in `resolved` is trusted. */
  async handleWebhook(
    rawBody: string,
    signature: string | null,
    timestamp: string | null,
    resolved: ResolvedWebhookPayload,
  ): Promise<WebhookOutcome> {
    const isValid = await this.provider.verifyWebhook({
      providerPaymentId: resolved.providerPaymentId,
      orderId: resolved.orderId,
      status: resolved.status,
      rawBody,
      signature,
      timestamp,
    });

    if (!isValid) {
      const suspect = await this.payments.getByOrderId(resolved.orderId);
      if (suspect) await this.payments.logEvent(suspect.id, "signature_invalid");
      logger.warn("payment:webhook-invalid-signature", { orderId: resolved.orderId });
      return { accepted: false, reason: "invalid_signature" };
    }

    const payment = await this.payments.getByOrderId(resolved.orderId);
    if (!payment) {
      logger.error("payment:webhook-unknown-order", { orderId: resolved.orderId });
      return { accepted: false, reason: "unknown_order" };
    }

    await this.payments.logEvent(payment.id, "webhook_received", { status: resolved.status });

    // Idempotent: a redelivered webhook for an already-terminal payment is a
    // no-op — closes "защита от двойной оплаты" for webhook retries.
    if (payment.status === "paid" || payment.status === "failed" || payment.status === "refunded") {
      return { accepted: true };
    }

    if (resolved.providerPaymentId && !payment.providerPaymentId) {
      await this.payments.markProviderPaymentId(payment.id, resolved.providerPaymentId);
    }

    const order = await this.orders.getOrder(resolved.orderId);
    if (!order) {
      logger.error("payment:webhook-order-not-found", { orderId: resolved.orderId });
      return { accepted: false, reason: "unknown_order" };
    }

    if (resolved.status === "paid") {
      await this.payments.updateStatus(payment.id, "paid");
      await this.payments.logEvent(payment.id, "confirmed");
      const paidOrder = await this.orders.confirmPayment(resolved.orderId);
      await this.events.publish({
        type: "payment.confirmed",
        order: paidOrder,
        paymentId: payment.id,
      });
    } else {
      await this.payments.updateStatus(payment.id, "failed", {
        failureReason: "provider_reported_failure",
      });
      await this.payments.logEvent(payment.id, "failed");
      await this.events.publish({
        type: "payment.failed",
        order,
        paymentId: payment.id,
        reason: "provider_reported_failure",
      });
    }

    return { accepted: true };
  }

  /** Reconciles local status against the provider — admin action and the return-page fallback (item 10, "повторную проверку статуса"). */
  async recheckStatus(paymentId: string): Promise<PaymentRecordDTO> {
    const payment = await this.payments.getById(paymentId);
    if (!payment) throw new PaymentNotFoundError();

    const providerPaymentId = payment.providerPaymentId;
    if (!providerPaymentId) return payment;
    if (payment.status === "paid" || payment.status === "failed" || payment.status === "refunded") {
      return payment;
    }

    const intent = await withRetry(
      () => this.provider.getStatus(providerPaymentId),
      PAYMENT_RETRY_OPTIONS,
    );
    await this.payments.logEvent(payment.id, "status_rechecked", {
      providerStatus: intent?.status ?? null,
    });

    if (!intent || intent.status === payment.status) return payment;

    if (intent.status === "paid") {
      const updated = await this.payments.updateStatus(payment.id, "paid");
      await this.orders.confirmPayment(payment.orderId);
      return updated;
    }

    if (intent.status === "failed") {
      return this.payments.updateStatus(payment.id, "failed", {
        failureReason: "provider_reported_failure",
      });
    }

    return payment;
  }

  /** Lazy expiry sweep — this app has no cron (mirrors OrderLifecycleCascadeService's lazy-sweep-on-read pattern). */
  async checkExpiry(payment: PaymentRecordDTO): Promise<PaymentRecordDTO> {
    if (payment.status !== "pending" && payment.status !== "awaiting") return payment;
    if (!payment.expiresAt || new Date(payment.expiresAt).getTime() > Date.now()) return payment;

    const expired = await this.payments.updateStatus(payment.id, "expired");
    await this.payments.logEvent(payment.id, "expired");
    return expired;
  }
}
