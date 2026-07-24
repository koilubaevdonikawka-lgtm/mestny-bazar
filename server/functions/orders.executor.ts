import type { OrderDTO } from "@shared/contracts/order";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { OrderNotFoundError, UnauthorizedError } from "@server/domain/orders.errors";

export async function executeListOrders(): Promise<OrderDTO[]> {
  const userId = await requireUserIdFromRequest();
  return getServices().orderService.listOrders(userId);
}

export async function executeGetOrder(orderId: string): Promise<OrderDTO> {
  const userId = await requireUserIdFromRequest();
  const order = await getServices().orderService.getOrder(orderId, userId);
  if (!order) {
    throw new OrderNotFoundError();
  }
  return order;
}

export { UnauthorizedError, OrderNotFoundError };
