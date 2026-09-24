import { getServices } from "@server/di/container";
import { OrderStatus } from "@shared/contracts/order";
import { logger } from "@shared/observability/logger";

/**
 * How far back the scheduled sweep looks. The latest a cascade can become due
 * is an ONLINE order paid right before its payment expires
 * (PaymentService.PAYMENT_EXPIRY_MS, 30 min) plus the 2-minute buffer, so an
 * hour covers every order the cron could still need to fire for — while
 * keeping each run's query small and never back-firing notifications for
 * old orders that simply predate this sweep. Anything older is still covered
 * by the lazy on-read trigger (AdminOrderService), exactly as before.
 */
const SWEEP_LOOKBACK_MS = 60 * 60 * 1000;

const CASCADE_CANDIDATE_STATUSES: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PAID];

export interface SweepOrderCascadeResult {
  scanned: number;
}

/**
 * Proactive trigger for order.operational_cascade_started — before this, the
 * cascade (and so NotificationCenter's admin/warehouse/courier notifications,
 * incl. the Telegram new-order message) only fired when staff happened to
 * open the admin order list/detail, so "notify the admin about a new order"
 * depended on the admin already looking at orders. Reuses
 * OrderLifecycleCascadeService.sweep() as-is: it's a no-op until the buffer
 * elapses and IOrderCascadeRepository.claim() guarantees the event fires
 * exactly once per order even alongside a concurrent admin read.
 */
export async function executeSweepOrderCascade(): Promise<SweepOrderCascadeResult> {
  const { orders, orderCascadeService } = getServices();

  const now = Date.now();
  const recent = await orders.listInPeriod(
    new Date(now - SWEEP_LOOKBACK_MS).toISOString(),
    new Date(now).toISOString(),
  );
  const candidates = recent.filter((order) => CASCADE_CANDIDATE_STATUSES.includes(order.status));

  await orderCascadeService.sweep(candidates);

  logger.info("order:cascade-sweep-completed", { scanned: candidates.length });

  return { scanned: candidates.length };
}
