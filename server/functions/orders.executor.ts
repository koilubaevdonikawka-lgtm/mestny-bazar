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
