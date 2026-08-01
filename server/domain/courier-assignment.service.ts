import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { ICourierAssignmentPolicy } from "@server/ports/courier-assignment.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";

/**
 * Orchestrates auto-assignment (platform-lifecycle.md §3, Шаг 3): fetches available
 * couriers + their current workload, asks the Rule Engine to pick one, persists the
 * assignment, publishes courier.assigned. A null pick (nobody available right now) is
 * a normal outcome — the caller (OrderLifecycleCascadeService's sweep) simply retries
 * on the next read, the same lazy self-healing pattern already used for the buffer gate.
 */
export class CourierAssignmentService {
  constructor(
    private readonly courierStatus: ICourierStatusRepository,
    private readonly orders: IOrderRepository,
    private readonly policy: ICourierAssignmentPolicy,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async assignCourier(order: OrderDTO): Promise<OrderDTO | null> {
    if (order.assignedCourierId) return order;

    const available = await this.courierStatus.listAvailable();
    if (available.length === 0) return null;

    const candidates = await Promise.all(
      available.map(async (courier) => ({
        courierId: courier.courierId,
        activeDeliveries: await this.orders.countActiveDeliveriesByCourier(courier.courierId),
      })),
    );

    const { courierId } = this.policy.selectCourier({ order, candidates });
    if (!courierId) return null;

    const updated = await this.orders.assignCourier(order.id, courierId);
    // Lost a concurrent assignment race — the order is already assigned to someone
    // else, don't publish a false courier.assigned for a courierId that didn't win.
    if (updated.assignedCourierId !== courierId) return updated;

    await this.events.publish({ type: "courier.assigned", order: updated, courierId });
    return updated;
  }
}
