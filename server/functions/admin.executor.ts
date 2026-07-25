import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { OrderLifecycleDeniedError } from "@server/domain/order-lifecycle/order-lifecycle.errors";
import {
  ForbiddenError,
  OrderNotFoundError,
  UnauthorizedError,
} from "@server/domain/orders.errors";

export async function executeListAdminOrders(params?: OrderListParams): Promise<OrderListResult> {
  await requireAdminFromRequest();
  return getServices().adminOrderService.listOrders(params);
}

export async function executeGetAdminOrder(orderId: string): Promise<OrderDTO> {
  await requireAdminFromRequest();
  return getServices().adminOrderService.getOrder(orderId);
}

export async function executeConfirmAdminOrder(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  return getServices().adminOrderService.confirmOrder(orderId, { id: userId, roles });
}

export async function executeCancelAdminOrder(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  return getServices().adminOrderService.cancelOrder(orderId, { id: userId, roles });
}

export function mapAdminError(error: unknown): never {
  if (error instanceof UnauthorizedError) throw error;
  if (error instanceof ForbiddenError) throw error;
  if (error instanceof OrderNotFoundError) throw error;
  if (error instanceof OrderLifecycleDeniedError) throw error;
  throw error;
}
