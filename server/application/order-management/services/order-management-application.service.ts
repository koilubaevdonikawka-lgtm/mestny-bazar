import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";
import {
  CancelOrderUseCase,
  CreateOrderUseCase,
  GetCustomerOrdersUseCase,
  GetOrderHistoryUseCase,
  GetOrderUseCase,
  UpdateOrderStatusUseCase,
} from "@server/application/order-management/use-cases/order-management.use-cases";

/** Application facade for order management scenario. */
export class OrderManagementApplicationService {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getCustomerOrdersUseCase: GetCustomerOrdersUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly getOrderHistoryUseCase: GetOrderHistoryUseCase,
  ) {}

  createOrder(customerId: string, checkoutId: string) {
    return this.createOrderUseCase.execute(customerId, checkoutId);
  }

  getOrder(orderId: string) {
    return this.getOrderUseCase.execute(orderId);
  }

  getCustomerOrders(customerId: string) {
    return this.getCustomerOrdersUseCase.execute(customerId);
  }

  updateStatus(
    orderId: string,
    status: OrderManagementStatus,
    actor?: string,
    reason?: string,
  ) {
    return this.updateOrderStatusUseCase.execute(orderId, status, actor, reason);
  }

  cancel(orderId: string, customerId: string, reason?: string) {
    return this.cancelOrderUseCase.execute(orderId, customerId, reason);
  }

  getHistory(orderId: string) {
    return this.getOrderHistoryUseCase.execute(orderId);
  }
}
