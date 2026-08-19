import type { OrderDTO } from "@shared/contracts/order";
import type { RetryPaymentResponse } from "@shared/contracts/payment";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { OrderNotFoundError, UnauthorizedError } from "@server/domain/orders.errors";
import { PaymentRetryNotAllowedError } from "@server/domain/payment.errors";

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

/**
 * No auth gate — mirrors executeCheckPaymentStatus's existing trust model
 * (server/functions/payment.executor.ts): orderId is a cryptographically
 * strong UUID, and knowledge of it is treated as sufficient access, same as
 * order-success.tsx already does for anonymous/guest checkouts. Returns the
 * full OrderDTO (not just a status subset) because OrderTimeline — the
 * component this feeds — is typed against the full DTO; the caller (cart)
 * only renders the status/timeline portion of it, never the address/phone/
 * items fields also present on the object.
 */
export async function executeGetOrderStatus(orderId: string): Promise<OrderDTO> {
  const order = await getServices().orderService.getOrder(orderId);
  if (!order) {
    throw new OrderNotFoundError();
  }
  return order;
}

export async function executeCancelOrder(orderId: string): Promise<OrderDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().orderService.cancelOrder(orderId, userId);
}

export async function executeRetryPayment(orderId: string): Promise<RetryPaymentResponse> {
  const userId = await requireUserIdFromRequest();
  const result = await getServices().paymentService.retryPayment(orderId, userId);
  return { paymentUrl: result.paymentUrl };
}

export { UnauthorizedError, OrderNotFoundError, PaymentRetryNotAllowedError };
