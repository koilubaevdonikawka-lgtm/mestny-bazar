import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { OrderNotFoundError } from "@server/domain/orders.errors";

export class OrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
  ) {}

  async createOrder(data: CreateOrderData): Promise<OrderDTO> {
    return this.orders.create(data);
  }

  async getOrderByIdempotencyKey(idempotencyKey: string): Promise<OrderDTO | null> {
    return this.orders.getByIdempotencyKey(idempotencyKey);
  }

  async getOrder(id: string, userId?: string): Promise<OrderDTO | null> {
    return this.orders.getById(id, userId);
  }

  async listOrders(userId: string): Promise<OrderDTO[]> {
    return this.orders.listByUser(userId);
  }

  async cancelOrder(orderId: string, userId: string): Promise<OrderDTO> {
    const order = await this.orders.getById(orderId, userId);
    if (!order) throw new OrderNotFoundError();

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus: OrderStatus.CANCELLED,
      actor: { id: userId },
      reason: "customer_cancel",
    });

    return this.orders.updateStatus(orderId, OrderStatus.CANCELLED);
  }
}
