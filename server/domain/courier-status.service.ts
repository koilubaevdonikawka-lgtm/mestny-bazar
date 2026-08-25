import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import type { CourierStatusDTO } from "@shared/contracts/courier-status";
import { OrderStatus } from "@shared/contracts/order";
import { logger } from "@shared/observability/logger";

/** Courier's own availability toggle (couriers.md — "через PWA"). */
export class CourierStatusService {
  constructor(
    private readonly courierStatus: ICourierStatusRepository,
    private readonly events: IMarketplaceEventBus,
    /** Задача №142 — lets setAvailability() try assigning waiting orders the
     * instant a courier comes online, instead of relying solely on
     * WarehouseOrderService.completeAssembly()'s attempt (Задача №140) or the
     * 2-minute cron backstop (tasks/courier/sweep-unassigned.ts). */
    private readonly orders: IOrderRepository,
    private readonly orderCascadeService: OrderLifecycleCascadeService,
  ) {}

  async setAvailability(courierId: string, isAvailable: boolean): Promise<CourierStatusDTO> {
    // Only needed to detect a false->true transition below — skip the read
    // entirely when going offline, where it's never used.
    const previous = isAvailable ? await this.courierStatus.get(courierId) : null;

    const status = await this.courierStatus.setAvailability(courierId, isAvailable);
    await this.events.publish({ type: "courier.status_changed", courierId, isAvailable });

    // Задача №142 — third, complementary trigger for courier auto-assignment
    // (on top of Задача №140's completeAssembly() attempt and the 2-minute
    // cron backstop): the moment a courier flips from unavailable to
    // available, don't make orders that piled up while they were offline
    // wait for the next cron tick. Reuses the exact same query
    // (tasks/courier/sweep-unassigned.ts's executeSweepUnassignedReadyOrders)
    // and OrderLifecycleCascadeService.sweep() — no new selection logic; the
    // just-available courier is simply now in the pool CourierAssignmentService
    // already considers. Never blocks or fails the status-toggle request itself.
    if (isAvailable && !previous?.isAvailable) {
      try {
        const readyOrders = await this.orders.listByStatuses([OrderStatus.READY_FOR_DELIVERY]);
        const unassigned = readyOrders.filter((order) => !order.assignedCourierId);
        await this.orderCascadeService.sweep(unassigned);
      } catch (error) {
        logger.error("courier:availability-assignment-sweep-failed", { courierId, error });
      }
    }

    return status;
  }
}
