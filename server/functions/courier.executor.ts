import type { OrderDTO } from "@shared/contracts/order";
import { requireCourierFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { OrderLifecycleDeniedError } from "@server/domain/order-lifecycle/order-lifecycle.errors";
import {
  ForbiddenError,
  OrderNotFoundError,
  UnauthorizedError,
} from "@server/domain/orders.errors";

export async function executeListCourierOrders(): Promise<OrderDTO[]> {
  await requireCourierFromRequest();
  return getServices().courierOrderService.listDeliveryOrders();
}

export async function executeGetCourierOrder(orderId: string): Promise<OrderDTO> {
  await requireCourierFromRequest();
  return getServices().courierOrderService.getOrder(orderId);
}

export async function executeAcceptCourierOrder(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.acceptOrder(orderId, { id: userId, roles });
}

export async function executeStartCourierDelivery(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.startDelivery(orderId, { id: userId, roles });
}

export async function executeMarkCourierArrival(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.markArrival(orderId, { id: userId, roles });
}

export async function executeCompleteCourierDelivery(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.completeDelivery(orderId, { id: userId, roles });
}

export function mapCourierError(error: unknown): never {
  if (error instanceof UnauthorizedError) throw error;
  if (error instanceof ForbiddenError) throw error;
  if (error instanceof OrderNotFoundError) throw error;
  if (error instanceof OrderLifecycleDeniedError) throw error;
  throw error;
}
