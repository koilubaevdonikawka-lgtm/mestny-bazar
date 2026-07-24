/**
 * Order Management — order lifecycle only.
 *
 * Creates orders from ready Order Drafts via ICheckoutOrderReader.
 * Does NOT perform payment or manage cart. No Product BCM / Cart / Checkout Repository access.
 */
import type { ICheckoutOrderReader } from "@server/application/order-management/contracts/checkout-order-reader.contract";
import type { IOrderAnalyticsProvider } from "@server/application/order-management/contracts/order-analytics-provider.contract";
import type { IOrderEventPublisher } from "@server/application/order-management/contracts/order-event-publisher.contract";
import type { IOrderHistoryRepository } from "@server/application/order-management/contracts/order-history-repository.contract";
import type { IOrderRepository } from "@server/application/order-management/contracts/order-repository.contract";
import type { IOrderStatusProvider } from "@server/application/order-management/contracts/order-status-provider.contract";
import {
  createCustomerOrder,
  OrderManagementStatus,
  type CustomerOrder,
  type OrderLine,
  withOrderStatus,
} from "@server/application/order-management/models/customer-order.model";
import {
  createOrderHistoryEntry,
  type CancelOrderResult,
  type CustomerOrdersListResult,
  type OrderHistoryView,
} from "@server/application/order-management/models/order-history.model";
import type { IIdGenerator } from "@server/application/ports";

export class OrderManagementService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly checkoutReader: ICheckoutOrderReader,
    private readonly statusProvider: IOrderStatusProvider,
    private readonly historyRepository: IOrderHistoryRepository,
    private readonly eventPublisher: IOrderEventPublisher,
    private readonly analyticsProvider: IOrderAnalyticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createOrder(customerId: string, checkoutId: string): Promise<CustomerOrder> {
    const summary = await this.checkoutReader.getCheckoutSummary(checkoutId);
    if (!summary) {
      throw new Error(`Checkout draft not found: ${checkoutId}`);
    }
    if (summary.customerId !== customerId.trim()) {
      throw new Error("Checkout does not belong to customer.");
    }
    if (!summary.ready) {
      throw new Error("Checkout is not ready for order creation.");
    }

    const validation = await this.checkoutReader.validateCheckout(customerId, checkoutId);
    if (!validation.valid) {
      throw new Error("Checkout validation failed.");
    }

    const order = createCustomerOrder({
      orderId: this.idGenerator.generate(),
      customerId,
      checkoutId,
      lines: summary.items.map(toOrderLine),
      subtotal: summary.subtotal,
      currency: summary.currency,
    });

    await this.orderRepository.save(order);
    await this.recordHistory(order.orderId, order.status, null, "Order created", customerId);
    await this.eventPublisher.publishOrderCreated(order.orderId, customerId);
    await this.analyticsProvider.trackOrderCreated(order.orderId, customerId, order.subtotal);

    return order;
  }

  async getOrder(orderId: string): Promise<CustomerOrder | null> {
    return this.orderRepository.findById(orderId);
  }

  async getCustomerOrders(customerId: string): Promise<CustomerOrdersListResult> {
    const orders = await this.orderRepository.findByCustomerId(customerId);
    return { orders, total: orders.length };
  }

  async getAllOrders(): Promise<readonly CustomerOrder[]> {
    return this.orderRepository.findAll();
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderManagementStatus,
    actor?: string,
    reason?: string,
  ): Promise<CustomerOrder> {
    const order = await this.requireOrder(orderId);

    if (!this.statusProvider.canTransition(order.status, status)) {
      throw new Error(`Invalid status transition: ${order.status} -> ${status}`);
    }

    const updated = withOrderStatus(order, status);
    await this.orderRepository.update(updated);
    await this.recordHistory(orderId, status, order.status, reason ?? "Status updated", actor ?? null);
    await this.eventPublisher.publishStatusChanged(orderId, status, order.status);
    await this.analyticsProvider.trackStatusChanged(orderId, status);

    return updated;
  }

  async cancelOrder(orderId: string, customerId: string, reason?: string): Promise<CancelOrderResult> {
    const order = await this.requireOrder(orderId);
    if (order.customerId !== customerId.trim()) {
      return { cancelled: false };
    }

    if (order.status === OrderManagementStatus.Cancelled) {
      return { cancelled: true };
    }

    if (this.statusProvider.isTerminal(order.status)) {
      throw new Error(`Order cannot be cancelled in status: ${order.status}`);
    }

    const updated = withOrderStatus(order, OrderManagementStatus.Cancelled);
    await this.orderRepository.update(updated);
    await this.recordHistory(
      orderId,
      OrderManagementStatus.Cancelled,
      order.status,
      reason ?? "Order cancelled",
      customerId,
    );
    await this.eventPublisher.publishOrderCancelled(orderId, customerId);
    await this.analyticsProvider.trackOrderCancelled(orderId, customerId);

    return { cancelled: true };
  }

  async getOrderHistory(orderId: string): Promise<OrderHistoryView> {
    await this.requireOrder(orderId);
    const entries = await this.historyRepository.findByOrderId(orderId);
    return { orderId, entries };
  }

  private async requireOrder(orderId: string): Promise<CustomerOrder> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return order;
  }

  private async recordHistory(
    orderId: string,
    status: OrderManagementStatus,
    previousStatus: OrderManagementStatus | null,
    reason: string,
    actor: string | null,
  ): Promise<void> {
    await this.historyRepository.append(
      createOrderHistoryEntry({
        id: this.idGenerator.generate(),
        orderId,
        status,
        previousStatus,
        reason,
        actor,
      }),
    );
  }
}

function toOrderLine(item: {
  productId: string;
  sellerId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
}): OrderLine {
  return Object.freeze({ ...item });
}

function isOrderManagementStatus(value: string): value is OrderManagementStatus {
  return Object.values(OrderManagementStatus).includes(value as OrderManagementStatus);
}

export { isOrderManagementStatus };
