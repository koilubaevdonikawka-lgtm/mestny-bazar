import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { CourierAssignmentService } from "@server/domain/courier-assignment.service";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { logger } from "@shared/observability/logger";

export interface WarehouseActor {
  id: string;
  roles: UserRole[];
}

// PAID was included here only to compensate for CONFIRMED silently reverting to PAID
// on re-read (see the order_status enum fix) — a merely-PAID order was never actually
// startable (WarehouseStartAssemblyRule requires CONFIRMED), so keeping it in this
// queue post-fix would just show staff orders they can't act on yet.
const ASSEMBLY_QUEUE_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.ASSEMBLING];

export class WarehouseOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
    private readonly events: IMarketplaceEventBus,
    /** Задача №140 — lets completeAssembly() try assigning a courier the
     * instant an order becomes ready, instead of relying solely on an
     * admin happening to read the order list (Задача №138's finding —
     * that lazy, read-triggered sweep was previously the ONLY path). */
    private readonly courierAssignment: CourierAssignmentService,
  ) {}

  async listAssemblyOrders(): Promise<OrderDTO[]> {
    return this.orders.listByStatuses(ASSEMBLY_QUEUE_STATUSES);
  }

  /** Задача №278 — items pre-sorted by category then product sort_order for the assembly screen; see IOrderRepository.getForAssembly. */
  async getOrder(id: string): Promise<OrderDTO> {
    const order = await this.orders.getForAssembly(id);
    if (!order) throw new OrderNotFoundError();
    return order;
  }

  async startAssembly(orderId: string, actor: WarehouseActor): Promise<OrderDTO> {
    const order = await this.transitionOrder(
      orderId,
      OrderStatus.ASSEMBLING,
      "warehouse_start_assembly",
      actor,
    );
    await this.events.publish({ type: "order.assembling_started", order });
    return order;
  }

  async completeAssembly(orderId: string, actor: WarehouseActor): Promise<OrderDTO> {
    const order = await this.transitionOrder(
      orderId,
      OrderStatus.READY_FOR_DELIVERY,
      "warehouse_complete_assembly",
      actor,
    );
    await this.events.publish({ type: "order.ready_for_delivery", order });

    // Задача №140 — best-effort: assignCourier() is itself a safe no-op
    // (returns null) when nobody is available/eligible right now, and the
    // assembly-completion above is already durable — a courier-assignment
    // hiccup must not surface as a failure of completing assembly. The
    // periodic sweep (tasks/courier/sweep-unassigned.ts) is the backstop
    // for whatever this attempt misses (no courier active yet, transient
    // error, etc.).
    try {
      await this.courierAssignment.assignCourier(order);
    } catch (error) {
      logger.error("warehouse:courier-assignment-failed", { orderId, error });
    }

    return order;
  }

  private async transitionOrder(
    orderId: string,
    targetStatus: OrderDTO["status"],
    reason: string,
    actor: WarehouseActor,
  ): Promise<OrderDTO> {
    const order = await this.getOrder(orderId);

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus,
      actor: { id: actor.id, roles: actor.roles },
      reason,
    });

    return this.orders.updateStatus(orderId, order.status, targetStatus);
  }
}
