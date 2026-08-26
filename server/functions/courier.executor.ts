import type { OrderDTO, OrderListParams, OrderListResult } from "@shared/contracts/order";
import type { CourierStatusDTO } from "@shared/contracts/courier-status";
import { requireCourierFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListCourierOrders(): Promise<OrderDTO[]> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.listDeliveryOrders({ id: userId, roles });
}

/** Задача №143 — self-scoped order history; always the calling courier's own id, never a caller-supplied one. */
export async function executeListCourierOrderHistory(
  params?: OrderListParams,
): Promise<OrderListResult> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.listOrderHistory({ id: userId, roles }, params);
}

export async function executeGetCourierOrder(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.getOrder(orderId, { id: userId, roles });
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

/** Задача №171 — courier marks a CASH order's payment as physically received on arrival. */
export async function executeMarkCourierCashPaymentReceived(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.markCashPaymentReceived(orderId, { id: userId, roles });
}

export async function executeCompleteCourierDelivery(orderId: string): Promise<OrderDTO> {
  const { userId, roles } = await requireCourierFromRequest();
  return getServices().courierOrderService.completeDelivery(orderId, { id: userId, roles });
}

export async function executeSetCourierAvailability(
  isAvailable: boolean,
): Promise<CourierStatusDTO> {
  const { userId } = await requireCourierFromRequest();
  return getServices().courierStatusService.setAvailability(userId, isAvailable);
}
