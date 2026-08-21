import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { CourierAssignmentService } from "@server/domain/courier-assignment.service";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { isWithinCancellationWindow } from "@shared/lib/order-cancellation";

/**
 * Orders past this point either weren't eligible for the cascade in the first
 * place, or have already been formally confirmed/cancelled — the cascade
 * question ("has the buffer expired?") is moot either way.
 */
const CASCADE_ELIGIBLE_STATUSES: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PAID];

/** Statuses where a courier should already have (or still needs) an assignment (platform-lifecycle.md §3). */
const COURIER_ASSIGNMENT_ELIGIBLE_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.ASSEMBLING,
  OrderStatus.READY_FOR_DELIVERY,
];

/**
 * Whether the cascade's 2-minute buffer has actually elapsed — CASH keeps
 * measuring from order creation (unchanged); ONLINE never fires while still
 * CREATED (payment not yet confirmed) and, once PAID, measures from paidAt
 * instead of createdAt. paidAt is expected to be set whenever status is PAID
 * (order.repository.ts's updatePaymentStatus stamps it in the same write
 * that flips payment_status to "paid") — a PAID order with a null paidAt is
 * treated as not yet eligible rather than falling back to createdAt, since
 * that fallback would silently reintroduce the exact bug this fixes.
 */
function isCascadeBufferElapsed(order: OrderDTO): boolean {
  if (!CASCADE_ELIGIBLE_STATUSES.includes(order.status)) return false;

  if (order.paymentMethod === "ONLINE") {
    if (order.status !== OrderStatus.PAID) return false;
    return !!order.paidAt && !isWithinCancellationWindow(order.paidAt);
  }

  return !isWithinCancellationWindow(order.createdAt);
}

/**
 * Buffer-as-gate for the operational cascade (docs/admin-platform/platform-lifecycle.md,
 * §3). The platform has no scheduler/cron — this is a lazy, idempotent sweep:
 * called redundantly on staff-facing order reads, it is a no-op until the
 * order's 2-minute cancellation window has actually elapsed, and fires the
 * cascade exactly once even under concurrent callers (IOrderCascadeRepository.claim
 * is the atomic idempotency boundary).
 *
 * For an ONLINE order the buffer must start from confirmed PAYMENT, not order
 * creation (Аудит Finik-готовности этой сессии): CREATED means the customer
 * clicked "Оформить" but Finik's webhook hasn't confirmed payment yet — the
 * cascade (which notifies the warehouse to start assembling) must never fire
 * for money that may still fail/expire within the next up-to-30 minutes
 * (PaymentService.PAYMENT_EXPIRY_MS). Only once status flips to PAID (and
 * OrderDTO.paidAt — server/adapters/supabase/order.repository.ts's
 * updatePaymentStatus already stamps it at that exact moment, no migration
 * needed) does the same 2-minute buffer apply, now measured from paidAt.
 * A CASH order has no such window to wait out — its buffer is unchanged,
 * still measured from createdAt.
 *
 * Also opportunistically (re-)attempts courier auto-assignment for orders that
 * are ready for one but don't have one yet — the same lazy, self-healing pattern:
 * "курьер может быть переназначен, если первоначально выбранный станет недоступен"
 * (couriers.md) means a failed/skipped assignment (nobody available) must not
 * strand the order — it just gets retried on the next staff read.
 */
export class OrderLifecycleCascadeService {
  constructor(
    private readonly cascades: IOrderCascadeRepository,
    private readonly events: IMarketplaceEventBus,
    private readonly courierAssignment: CourierAssignmentService,
  ) {}

  async checkAndTrigger(order: OrderDTO): Promise<void> {
    if (isCascadeBufferElapsed(order)) {
      const claimed = await this.cascades.claim(order.id);
      if (claimed) {
        await this.events.publish({ type: "order.operational_cascade_started", order });
      }
    }

    if (!order.assignedCourierId && COURIER_ASSIGNMENT_ELIGIBLE_STATUSES.includes(order.status)) {
      await this.courierAssignment.assignCourier(order);
    }
  }

  /** Sweeps a batch of orders — failures are isolated per-order, never fail the caller's read. */
  async sweep(orders: OrderDTO[]): Promise<void> {
    await Promise.allSettled(orders.map((order) => this.checkAndTrigger(order)));
  }
}
