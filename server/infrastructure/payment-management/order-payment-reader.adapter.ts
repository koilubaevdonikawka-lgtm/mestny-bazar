import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";
import type {
  IOrderPaymentReader,
  OrderPaymentSnapshot,
} from "@server/application/payment-management/contracts/order-payment-reader.contract";

const PAYABLE_STATUSES = new Set<string>([
  OrderManagementStatus.Created,
  OrderManagementStatus.Confirmed,
]);

/** Adapts Order Management to IOrderPaymentReader — no Order Repository access. */
export class OrderPaymentReaderAdapter implements IOrderPaymentReader {
  constructor(private readonly orders: OrderManagementApplicationService) {}

  async getOrderForPayment(orderId: string): Promise<OrderPaymentSnapshot | null> {
    const result = await this.orders.getOrder(orderId);
    const order = result.value;
    if (!order) {
      return null;
    }

    return Object.freeze({
      orderId: order.orderId,
      customerId: order.customerId,
      subtotal: order.subtotal,
      currency: order.currency,
      status: order.status,
      payable: PAYABLE_STATUSES.has(order.status),
    });
  }
}
