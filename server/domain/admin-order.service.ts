import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { OrderNotFoundError } from "@server/domain/orders.errors";

export interface AdminActor {
  id: string;
  roles: UserRole[];
}

export class AdminOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
  ) {}

  async listOrders(): Promise<OrderDTO[]> {
    return this.orders.listAll();
  }

  async getOrder(id: string): Promise<OrderDTO> {
    const order = await this.orders.getById(id);
    if (!order) throw new OrderNotFoundError();
    return order;
  }

  async confirmOrder(orderId: string, actor: AdminActor): Promise<OrderDTO> {
    return this.transitionOrder(orderId, OrderStatus.CONFIRMED, "admin_confirm", actor);
  }

  async cancelOrder(orderId: string, actor: AdminActor): Promise<OrderDTO> {
    return this.transitionOrder(orderId, OrderStatus.CANCELLED, "admin_cancel", actor);
  }

  private async transitionOrder(
    orderId: string,
    targetStatus: OrderDTO["status"],
    reason: string,
    actor: AdminActor,
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
