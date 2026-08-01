import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { isWithinCancellationWindow } from "@shared/lib/order-cancellation";

/**
 * Orders past this point either weren't eligible for the cascade in the first
 * place, or have already been formally confirmed/cancelled — the cascade
 * question ("has the buffer expired?") is moot either way.
 */
const CASCADE_ELIGIBLE_STATUSES: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PAID];

/**
 * Buffer-as-gate for the operational cascade (docs/admin-platform/platform-lifecycle.md,
 * §3). The platform has no scheduler/cron — this is a lazy, idempotent sweep:
 * called redundantly on staff-facing order reads, it is a no-op until the
 * order's 2-minute cancellation window has actually elapsed, and fires the
 * cascade exactly once even under concurrent callers (IOrderCascadeRepository.claim
 * is the atomic idempotency boundary).
 */
export class OrderLifecycleCascadeService {
  constructor(
    private readonly cascades: IOrderCascadeRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async checkAndTrigger(order: OrderDTO): Promise<void> {
    if (!CASCADE_ELIGIBLE_STATUSES.includes(order.status)) return;
    if (isWithinCancellationWindow(order.createdAt)) return;

    const claimed = await this.cascades.claim(order.id);
    if (!claimed) return;

    await this.events.publish({ type: "order.operational_cascade_started", order });
  }

  /** Sweeps a batch of orders — failures are isolated per-order, never fail the caller's read. */
  async sweep(orders: OrderDTO[]): Promise<void> {
    await Promise.allSettled(orders.map((order) => this.checkAndTrigger(order)));
  }
}
