import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";
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

  /**
   * Задача №143 — full order history for this courier (delivered and any
   * non-delivered terminal orders, e.g. admin-cancelled after assignment),
   * not just the active delivery queue. Reuses the same listByCourier()
   * AdminOrderService.listOrdersByCourier() already uses for the admin-side
   * courier detail view — self-scoped to actor.id only, so a courier can
   * never see another courier's history through this path.
   */
  async listOrderHistory(actor: CourierActor, params?: OrderListParams): Promise<OrderListResult> {
    return this.orders.listByCourier(actor.id, params);
  }

  /**
   * Задача №135 — a courier may view: an order already assigned to them, or
   * an unassigned order still in the READY_FOR_DELIVERY acceptance queue
   * (the same "free claim" case acceptOrder() itself allows, per couriers.md
   * — a courier told an order id out-of-band can look it up before
   * deciding to accept it). Any other courier's already-assigned order is
   * not visible — closes the Задача №134 gap where getOrder() returned any
   * order to any authenticated courier.
   */
  async getOrder(id: string, actor: CourierActor): Promise<OrderDTO> {
    const order = await this.orders.getById(id);
    if (!order) throw new OrderNotFoundError();

    const isOwnOrder = order.assignedCourierId === actor.id;
    const isUnclaimedAndAcceptable =
      !order.assignedCourierId && order.status === OrderStatus.READY_FOR_DELIVERY;
    if (!isOwnOrder && !isUnclaimedAndAcceptable) {
      throw new ForbiddenError("Access denied — order is assigned to a different courier");
    }

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
    const order = await this.getOrder(orderId, actor);

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
    const order = await this.getOrder(orderId, actor);

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus,
      actor: { id: actor.id, roles: actor.roles },
      reason,
      assignedCourierId: order.assignedCourierId,
    });

    return this.orders.updateStatus(orderId, order.status, targetStatus);
  }
}
