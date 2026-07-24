import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";
import { OrderNotFoundError } from "@server/domain/orders.errors";

export interface WarehouseActor {
  id: string;
  roles: UserRole[];
}

const ASSEMBLY_QUEUE_STATUSES = new Set<OrderDTO["status"]>([
  OrderStatus.CONFIRMED,
  OrderStatus.PAID,
  OrderStatus.ASSEMBLING,
]);

export class WarehouseOrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
  ) {}

  async listAssemblyOrders(): Promise<OrderDTO[]> {
    const all = await this.orders.listAll();
    return all.filter((order) => ASSEMBLY_QUEUE_STATUSES.has(order.status));
  }

  async getOrder(id: string): Promise<OrderDTO> {
    const order = await this.orders.getById(id);
    if (!order) throw new OrderNotFoundError();
    return order;
  }

  async startAssembly(orderId: string, actor: WarehouseActor): Promise<OrderDTO> {
    return this.transitionOrder(orderId, OrderStatus.ASSEMBLING, "warehouse_start_assembly", actor);
  }

  async completeAssembly(orderId: string, actor: WarehouseActor): Promise<OrderDTO> {
    return this.transitionOrder(
      orderId,
      OrderStatus.READY_FOR_DELIVERY,
      "warehouse_complete_assembly",
      actor,
    );
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

    return this.orders.updateStatus(orderId, targetStatus);
  }
}
