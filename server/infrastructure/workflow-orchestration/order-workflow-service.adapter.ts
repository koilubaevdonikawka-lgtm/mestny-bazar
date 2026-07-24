import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";
import type {
  CreateOrderWorkflowResult,
  IOrderWorkflowService,
  OrderWorkflowSnapshot,
} from "@server/application/workflow-orchestration/contracts/order-workflow-service.contract";

/** Adapts Order Management Application Service to IOrderWorkflowService. */
export class OrderWorkflowServiceAdapter implements IOrderWorkflowService {
  constructor(private readonly orders: OrderManagementApplicationService) {}

  async createFromCheckout(
    customerId: string,
    checkoutId: string,
  ): Promise<CreateOrderWorkflowResult> {
    const result = await this.orders.createOrder(customerId, checkoutId);
    const order = result.value;
    return Object.freeze({
      orderId: order.orderId,
      customerId: order.customerId,
      status: order.status,
    });
  }

  async confirmOrder(orderId: string): Promise<void> {
    await this.orders.updateStatus(orderId, OrderManagementStatus.Confirmed);
  }

  async markProcessing(orderId: string): Promise<void> {
    await this.orders.updateStatus(orderId, OrderManagementStatus.Processing);
  }

  async markShipped(orderId: string): Promise<void> {
    await this.orders.updateStatus(orderId, OrderManagementStatus.Shipped);
  }

  async markDelivered(orderId: string): Promise<void> {
    await this.orders.updateStatus(orderId, OrderManagementStatus.Delivered);
  }

  async cancelOrder(orderId: string, customerId: string, reason?: string): Promise<boolean> {
    const result = await this.orders.cancel(orderId, customerId, reason);
    return result.value.cancelled;
  }

  async getOrder(orderId: string): Promise<OrderWorkflowSnapshot | null> {
    const result = await this.orders.getOrder(orderId);
    const order = result.value;
    if (!order) {
      return null;
    }

    return Object.freeze({
      orderId: order.orderId,
      customerId: order.customerId,
      status: order.status,
    });
  }
}
