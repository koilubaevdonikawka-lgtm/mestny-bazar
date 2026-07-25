import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { OrderNotFoundError } from "@server/domain/orders.errors";

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
  ) {}

  async listDeliveryOrders(): Promise<OrderDTO[]> {
    return this.orders.listByStatuses(DELIVERY_QUEUE_STATUSES);
  }

  async getOrder(id: string): Promise<OrderDTO> {
    const order = await this.orders.getById(id);
    if (!order) throw new OrderNotFoundError();
    return order;
  }

  async acceptOrder(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    const order = await this.getOrder(orderId);
    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus: OrderStatus.READY_FOR_DELIVERY,
      actor: { id: actor.id, roles: actor.roles },
      reason: "courier_accept",
    });
    return order;
  }

  async startDelivery(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    return this.transitionOrder(
      orderId,
      OrderStatus.OUT_FOR_DELIVERY,
      "courier_start_delivery",
      actor,
    );
  }

  async markArrival(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    return this.transitionOrder(orderId, OrderStatus.ARRIVED, "courier_arrive", actor);
  }

  async completeDelivery(orderId: string, actor: CourierActor): Promise<OrderDTO> {
    return this.transitionOrder(orderId, OrderStatus.DELIVERED, "courier_complete_delivery", actor);
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

    return this.orders.updateStatus(orderId, targetStatus);
  }
}
