import type { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";
import type { CustomerOrder } from "@server/application/order-management/models/customer-order.model";
import type {
  CancelOrderResult,
  CustomerOrdersListResult,
  OrderHistoryView,
} from "@server/application/order-management/models/order-history.model";
import type { OrderManagementService } from "@server/application/order-management/services/order-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateOrderUseCase {
  constructor(private readonly orders: OrderManagementService) {}

  execute(customerId: string, checkoutId: string): Promise<UseCaseResult<CustomerOrder>> {
    return this.orders.createOrder(customerId, checkoutId).then(useCaseResult);
  }
}

export class GetOrderUseCase {
  constructor(private readonly orders: OrderManagementService) {}

  async execute(orderId: string): Promise<UseCaseResult<CustomerOrder | null>> {
    return useCaseResult(await this.orders.getOrder(orderId));
  }
}

export class GetCustomerOrdersUseCase {
  constructor(private readonly orders: OrderManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<CustomerOrdersListResult>> {
    return this.orders.getCustomerOrders(customerId).then(useCaseResult);
  }
}

export class UpdateOrderStatusUseCase {
  constructor(private readonly orders: OrderManagementService) {}

  execute(
    orderId: string,
    status: OrderManagementStatus,
    actor?: string,
    reason?: string,
  ): Promise<UseCaseResult<CustomerOrder>> {
    return this.orders.updateOrderStatus(orderId, status, actor, reason).then(useCaseResult);
  }
}

export class CancelOrderUseCase {
  constructor(private readonly orders: OrderManagementService) {}

  execute(
    orderId: string,
    customerId: string,
    reason?: string,
  ): Promise<UseCaseResult<CancelOrderResult>> {
    return this.orders.cancelOrder(orderId, customerId, reason).then(useCaseResult);
  }
}

export class GetOrderHistoryUseCase {
  constructor(private readonly orders: OrderManagementService) {}

  execute(orderId: string): Promise<UseCaseResult<OrderHistoryView>> {
    return this.orders.getOrderHistory(orderId).then(useCaseResult);
  }
}
