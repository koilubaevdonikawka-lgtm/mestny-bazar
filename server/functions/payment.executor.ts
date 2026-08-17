import type { PaymentStatusCheckDTO } from "@shared/contracts/payment";
import { getServices } from "@server/di/container";
import { OrderNotFoundError } from "@server/domain/orders.errors";

/**
 * No auth gate — mirrors order-success.tsx's existing trust model (orderId
 * knowledge is sufficient, same as the pre-existing anonymous order-success
 * confirmation page already has for orderNumber). Only exposes payment/order
 * status, never personal details.
 */
export async function executeCheckPaymentStatus(orderId: string): Promise<PaymentStatusCheckDTO> {
  const services = getServices();
  const order = await services.orderService.getOrder(orderId);
  if (!order) throw new OrderNotFoundError();

  const payment = await services.paymentRepository.getByOrderId(orderId);
  if (!payment) {
    return {
      status: order.paymentStatus === "paid" ? "paid" : "pending",
      orderStatus: order.status,
    };
  }

  const reconciled = await services.paymentService.recheckStatus(payment.id);
  return { status: reconciled.status, orderStatus: order.status };
}

export { OrderNotFoundError };
