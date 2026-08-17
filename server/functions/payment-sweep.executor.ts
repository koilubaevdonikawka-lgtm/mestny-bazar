import { getServices } from "@server/di/container";
import { logger } from "@shared/observability/logger";

export interface SweepExpiredPaymentsResult {
  scanned: number;
  swept: number;
  failed: number;
}

/**
 * Lazy expiry sweep, proactive edition — invoked on a schedule (Cloudflare
 * Cron Trigger via Nitro's `scheduledTasks`, see tasks/payment/sweep-expired.ts)
 * rather than only on-read, so a payment nobody ever returns to check on
 * (abandoned checkout, no return-page visit) still transitions to `expired`
 * and its reserved stock isn't held indefinitely. `PaymentService.checkExpiry`
 * itself re-validates status/expiry per item, so this stays correct even if
 * the underlying query races with a payment being confirmed concurrently.
 * One item's failure must not abort the rest of the batch.
 */
export async function executeSweepExpiredPayments(): Promise<SweepExpiredPaymentsResult> {
  const { paymentRepository, paymentService } = getServices();

  const candidates = await paymentRepository.listExpiredPending();
  let swept = 0;
  let failed = 0;

  for (const payment of candidates) {
    try {
      const result = await paymentService.checkExpiry(payment);
      if (result.status === "expired") swept++;
    } catch (error) {
      failed++;
      logger.error("payment:sweep-item-failed", { paymentId: payment.id, error });
    }
  }

  logger.info("payment:sweep-completed", { scanned: candidates.length, swept, failed });

  return { scanned: candidates.length, swept, failed };
}
