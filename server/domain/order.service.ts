import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import type { OrderDTO } from "@shared/contracts/order";

export class OrderService {
  constructor(private readonly orders: IOrderRepository) {}

  async createOrder(data: CreateOrderData): Promise<OrderDTO> {
    return this.orders.create(data);
  }

  async getOrder(id: string, userId?: string): Promise<OrderDTO | null> {
    return this.orders.getById(id, userId);
  }

  async listOrders(userId: string): Promise<OrderDTO[]> {
    return this.orders.listByUser(userId);
  }
}
