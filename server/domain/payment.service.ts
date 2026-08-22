import type { IPaymentRepository } from "@server/ports/payment.repository";
import type { IPaymentProvider, PaymentWebhookPayload } from "@server/ports/payment.provider";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderService } from "@server/domain/order.service";
import type { InventoryService } from "@server/domain/inventory.service";
import type { VariantStockService } from "@server/domain/variant-stock.service";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { PaymentRecordDTO } from "@shared/contracts/payment";
import { FINIK_WEBHOOK_PATH } from "@shared/contracts/payment";
import { withRetry } from "@shared/lib/with-retry";
import {
  PaymentNotFoundError,
  PaymentProviderError,
  PaymentRetryNotAllowedError,
} from "@server/domain/payment.errors";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { logger } from "@shared/observability/logger";

const PAYMENT_RETRY_OPTIONS = { attempts: 3, delayMs: 500 };
const PAYMENT_EXPIRY_MS = 30 * 60 * 1000;

export interface InitiatePaymentResult {
  paymentUrl: string | null;
  paymentId: string;
}

export interface ResolvedWebhookPayload {
  providerPaymentId: string;
  /** Finik's redelivery identifier for this specific webhook delivery (falls back to `id` — Промпт №080). Logged for traceability; the terminal-status check below is what actually makes redelivery a no-op. */
  transactionId: string;
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
    /** Below: sweepExpiry()'s own dependencies (Промпт №087) — direct repository/service access, bypassing OrderService, since cancelling for payment expiry needs the order-lifecycle rule engine + both stock ports directly, and none of that belongs added to OrderService itself for this one background flow. */
    private readonly orderRepository: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
    private readonly inventory: InventoryService,
    private readonly variantStock: VariantStockService,
  ) {}

  async initiatePayment(order: OrderDTO, idempotencyKey: string): Promise<InitiatePaymentResult> {
    const existing = await this.payments.getByIdempotencyKey(idempotencyKey);
    if (existing) {
      logger.info("payment:idempotent-replay", {
        orderId: order.id,
        idempotencyKey,
        paymentId: existing.id,
      });
      return { paymentUrl: existing.paymentUrl, paymentId: existing.id };
    }

    const returnUrl = `${this.appUrl}/order-success?orderId=${order.id}&orderNumber=${order.orderNumber}`;
    const webhookUrl = `${this.appUrl}${FINIK_WEBHOOK_PATH}`;

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
            webhookUrl,
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

  /**
   * БАГ 3 fix — lets a customer retry payment for their own order when the
   * previous attempt never reached a terminal success: either the order has
   * no payment record at all yet (`preparePayment` failed before persisting
   * one — checkout.service.ts's documented "created-but-payment-not-
   * prepared" gap) or its latest payment record is stuck pending/awaiting/
   * failed. Always mints a brand-new idempotency key — reusing the failed
   * attempt's key would just replay the SAME (already-failed) payment
   * record via initiatePayment's own idempotency short-circuit above,
   * never create a new one.
   */
  async retryPayment(orderId: string, userId: string): Promise<InitiatePaymentResult> {
    const order = await this.orders.getOrder(orderId, userId);
    if (!order) throw new OrderNotFoundError();

    if (order.paymentMethod !== "ONLINE") {
      throw new PaymentRetryNotAllowedError("Only ONLINE-payment orders can retry payment");
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new PaymentRetryNotAllowedError("Cannot retry payment for a cancelled order");
    }
    if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") {
      throw new PaymentRetryNotAllowedError("This order's payment is already resolved");
    }

    const previous = await this.payments.getByOrderId(orderId);
    const newIdempotencyKey = crypto.randomUUID();

    logger.info("payment:retry-initiated", {
      orderId,
      previousPaymentId: previous?.id ?? null,
      previousPaymentStatus: previous?.status ?? null,
      newIdempotencyKey,
    });

    return this.initiatePayment(order, newIdempotencyKey);
  }

  /**
   * Signature must be verified before anything in `resolved` is trusted.
   * `webhookRequest` carries the raw request shape `IPaymentProvider.
   * verifyWebhook()` needs (method/path/host/headers/query/body) — Finik has
   * no `order_id` in the payload at all, so the local payment record is
   * looked up by `providerPaymentId` (the `PaymentId` we chose and sent when
   * creating the payment, echoed back as `fields.paymentId`) instead.
   */
  async handleWebhook(
    webhookRequest: PaymentWebhookPayload,
    resolved: ResolvedWebhookPayload,
  ): Promise<WebhookOutcome> {
    const isValid = await this.provider.verifyWebhook(webhookRequest);

    if (!isValid) {
      const suspect = await this.payments.getByProviderPaymentId(resolved.providerPaymentId);
      if (suspect) await this.payments.logEvent(suspect.id, "signature_invalid");
      logger.warn("payment:webhook-invalid-signature", {
        providerPaymentId: resolved.providerPaymentId,
      });
      return { accepted: false, reason: "invalid_signature" };
    }

    const payment = await this.payments.getByProviderPaymentId(resolved.providerPaymentId);
    if (!payment) {
      logger.error("payment:webhook-unknown-payment", {
        providerPaymentId: resolved.providerPaymentId,
      });
      return { accepted: false, reason: "unknown_order" };
    }

    await this.payments.logEvent(payment.id, "webhook_received", {
      status: resolved.status,
      transactionId: resolved.transactionId,
    });

    // Idempotent: a redelivered webhook for an already-terminal payment is a
    // no-op — closes "защита от двойной оплаты" for webhook retries (Finik
    // redelivers the identical payload for up to 24h, Промпт №080).
    if (payment.status === "paid" || payment.status === "failed" || payment.status === "refunded") {
      return { accepted: true };
    }

    const order = await this.orders.getOrder(payment.orderId);
    if (!order) {
      logger.error("payment:webhook-order-not-found", { orderId: payment.orderId });
      return { accepted: false, reason: "unknown_order" };
    }

    if (resolved.status === "paid") {
      await this.payments.updateStatus(payment.id, "paid");
      await this.payments.logEvent(payment.id, "confirmed");
      const paidOrder = await this.orders.confirmPayment(payment.orderId);
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

  /**
   * Промпт №087 — the scheduled sweep's entry point (server/functions/
   * payment-sweep.executor.ts), invoked once per candidate from
   * IPaymentRepository.listExpiredPending(). checkExpiry() itself is
   * unchanged: it only ever flips the payment row to "expired". Everything
   * below only runs the one time a call here is the one that actually
   * performed that transition (`wasPendingOrAwaiting` guard) — a payment
   * that was already "expired" on a previous sweep run must not release
   * stock or cancel the order a second time.
   *
   * Uses IOrderLifecyclePolicy.canTransition (not assertCanTransition) and
   * tolerates a denial silently: the only realistic denial here is the
   * order no longer being CREATED (e.g. the customer already self-cancelled
   * it in the interim) — TerminalStateGuardRule already blocked that
   * transition, and that other path already released this order's stock,
   * so skipping is correct, not an error.
   */
  async sweepExpiry(payment: PaymentRecordDTO): Promise<PaymentRecordDTO> {
    const wasPendingOrAwaiting = payment.status === "pending" || payment.status === "awaiting";
    const result = await this.checkExpiry(payment);
    if (!wasPendingOrAwaiting || result.status !== "expired") return result;

    const order = await this.orders.getOrder(payment.orderId);
    if (!order) {
      logger.error("payment:expiry-order-not-found", {
        orderId: payment.orderId,
        paymentId: payment.id,
      });
      return result;
    }

    const transition = this.orderLifecycle.canTransition({
      orderId: order.id,
      currentStatus: order.status,
      targetStatus: OrderStatus.CANCELLED,
      actor: { id: null },
      reason: "payment_expired",
      orderCreatedAt: order.createdAt,
    });
    if (!transition.allowed) {
      logger.info("payment:expiry-order-transition-skipped", {
        orderId: order.id,
        paymentId: payment.id,
        denialCode: transition.denialCode,
      });
      return result;
    }

    const cancelled = await this.orderRepository.updateStatus(
      order.id,
      order.status,
      OrderStatus.CANCELLED,
    );

    // Same acceptable narrow-window tradeoff CheckoutService/OrderService
    // already make for their own release-on-error paths — the order is
    // already durably cancelled at this point, a stock-release hiccup must
    // not undo that.
    const stockItems = cancelled.items
      .filter((item): item is typeof item & { productId: string } => item.productId !== null)
      .map((item) => ({ productId: item.productId, quantity: item.quantity }));
    const variantStockItems = cancelled.items
      .filter((item): item is typeof item & { variantId: string } => item.variantId !== null)
      .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));

    if (stockItems.length > 0) {
      await this.inventory.releaseStock(stockItems).catch((error) => {
        logger.error("payment:expiry-stock-release-failed", { orderId: order.id, error });
      });
    }
    if (variantStockItems.length > 0) {
      await this.variantStock.releaseStock(variantStockItems).catch((error) => {
        logger.error("payment:expiry-variant-stock-release-failed", { orderId: order.id, error });
      });
    }

    await this.events.publish({
      type: "payment.expired",
      order: cancelled,
      paymentId: payment.id,
    });

    return result;
  }
}
