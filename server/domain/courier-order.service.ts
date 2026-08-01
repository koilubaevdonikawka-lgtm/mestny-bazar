import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { ForbiddenError, OrderNotFoundError } from "@server/domain/orders.errors";

export interface CourierActor {
  id: string;
  roles: UserRole[];
}

const DELIVERY_QUEUE_STATUSES: OrderStatus[] = [
  OrderStatus.READY_FOR_DELIVERY,
  OrderStatus.ASSEMBLING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.ARRIVED,
];

export class CourierOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
    private readonly events: IMarketplaceEventBus,
    private readonly courierStatus: ICourierStatusRepository,
  ) {}

  /** Closes couriers.md's documented gap: only THIS courier's assigned orders, not the shared queue. */
  async listDeliveryOrders(actor: CourierActor): Promise<OrderDTO[]> {
    await this.courierStatus.touch(actor.id);
    return this.orders.listByStatusesForCourier(DELIVERY_QUEUE_STATUSES, actor.id);
  }

  async getOrder(id: string): Promise<OrderDTO> {
    const order = await this.orders.getById(id);
    if (!order) throw new OrderNotFoundError();
    return order;
  }

  /**
   * Auto-assignment (CourierAssignmentService, triggered from the buffer cascade) is
   * the primary path. This remains a fallback claim for the edge case where no courier
   * was available at cascade time — it now genuinely persists assignedCourierId
   * instead of being a check-only no-op, and only succeeds for an order that either
   * has no courier yet or is already assigned to this same courier.
   */
  async acceptOrder(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    const order = await this.getOrder(orderId);

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus: OrderStatus.READY_FOR_DELIVERY,
      actor: { id: actor.id, roles: actor.roles },
      reason: "courier_accept",
    });

    if (order.assignedCourierId && order.assignedCourierId !== actor.id) {
      throw new ForbiddenError("Order is already assigned to another courier");
    }
    if (order.assignedCourierId === actor.id) {
      return order;
    }

    const assigned = await this.orders.assignCourier(orderId, actor.id);
    if (assigned.assignedCourierId !== actor.id) {
      throw new ForbiddenError("Order is already assigned to another courier");
    }
    await this.events.publish({ type: "courier.assigned", order: assigned, courierId: actor.id });
    return assigned;
  }

  async startDelivery(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    const order = await this.transitionOrder(
      orderId,
      OrderStatus.OUT_FOR_DELIVERY,
      "courier_start_delivery",
      actor,
    );
    await this.events.publish({ type: "order.out_for_delivery", order });
    return order;
  }

  async markArrival(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    const order = await this.transitionOrder(orderId, OrderStatus.ARRIVED, "courier_arrive", actor);
    await this.events.publish({ type: "order.arrived", order });
    return order;
  }

  async completeDelivery(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    const order = await this.transitionOrder(
      orderId,
      OrderStatus.DELIVERED,
      "courier_complete_delivery",
      actor,
    );
    await this.events.publish({ type: "order.delivered", order });
    return order;
  }

  private async transitionOrder(
    orderId: string,
    targetStatus: OrderDTO["status"],
    reason: string,
    actor: CourierActor,
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
