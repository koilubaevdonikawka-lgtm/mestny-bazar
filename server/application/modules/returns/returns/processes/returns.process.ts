import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import { OrderStatus } from "@server/application/modules/order/order/models";
import type { InventoryModule } from "@server/application/modules/inventory/inventory/api/inventory.module";
import type { StartReturnDto } from "@server/application/modules/returns/returns/dto";
import {
  createReturnContext,
  createReturnRequest,
  createReturnResult,
  createReturnedItem,
  type ReturnContext,
  type ReturnResult,
  withReturnOrder,
  withReturnRequest,
  withReturnedItems,
  withReturnUpdatedOrder,
} from "@server/application/modules/returns/returns/models";

const RETURN_ELIGIBLE_STATUSES = new Set<string>([
  OrderStatus.Delivered,
  OrderStatus.Completed,
]);

const RETURN_BLOCKED_STATUSES = new Set<string>([
  OrderStatus.Refunded,
  OrderStatus.Returned,
  OrderStatus.Cancelled,
  OrderStatus.Draft,
  OrderStatus.PendingPayment,
]);

/** Returns business process orchestrator — coordinates capability modules through public APIs. */
export class ReturnsProcess {
  constructor(
    private readonly orders: OrderModule,
    private readonly inventory: InventoryModule,
    private readonly notifications: NotificationModule,
  ) {}

  async execute(input: StartReturnDto): Promise<ReturnResult> {
    let state = createReturnContext(input);
    state = await this.stepLoadOrder(state);
    state = this.stepVerifyReturnEligibility(state);
    state = this.stepCreateReturnRequest(state);
    state = await this.stepRestoreStock(state);
    state = await this.stepUpdateOrderStatus(state);
    state = await this.stepSendNotifications(state);
    return this.stepBuildResult(state);
  }

  private async stepLoadOrder(context: ReturnContext): Promise<ReturnContext> {
    const order = await this.orders.getOrder(context.request.orderId);
    if (!order) {
      throw new Error(`Order not found: ${context.request.orderId}`);
    }
    return withReturnOrder(context, order);
  }

  private stepVerifyReturnEligibility(context: ReturnContext): ReturnContext {
    const order = requireOrder(context);

    if (RETURN_BLOCKED_STATUSES.has(order.status)) {
      throw new Error(`Order ${order.id} is not eligible for return. Current status: ${order.status}.`);
    }

    if (!RETURN_ELIGIBLE_STATUSES.has(order.status)) {
      throw new Error(
        `Order ${order.id} must be delivered before return. Current status: ${order.status}.`,
      );
    }

    if (order.items.length === 0) {
      throw new Error(`Order ${order.id} has no items to return.`);
    }

    if (!context.request.reason.trim()) {
      throw new Error("Return reason is required.");
    }

    return context;
  }

  private stepCreateReturnRequest(context: ReturnContext): ReturnContext {
    const order = requireOrder(context);
    const returnRequest = createReturnRequest({
      id: `ret-${order.id}`,
      orderId: order.id,
      customerId: order.customerId,
      reason: context.request.reason,
    });

    return withReturnRequest(context, returnRequest);
  }

  private async stepRestoreStock(context: ReturnContext): Promise<ReturnContext> {
    const order = requireOrder(context);
    const returnedItems = [];

    for (const item of order.items) {
      const previousStock = await this.inventory.getAvailableQuantity(item.productId);
      if (previousStock === null) {
        throw new Error(`Product ${item.productId} stock is unavailable for return restoration.`);
      }

      await this.inventory.adjustQuantity({
        productId: item.productId,
        quantityDelta: item.quantity,
        referenceId: order.id,
      });

      const restoredStock = (await this.inventory.getAvailableQuantity(item.productId)) ?? previousStock;

      returnedItems.push(
        createReturnedItem({
          productId: item.productId,
          sellerId: item.sellerId,
          name: item.name,
          quantity: item.quantity,
          previousStock,
          restoredStock,
        }),
      );
    }

    return withReturnedItems(context, Object.freeze(returnedItems));
  }

  private async stepUpdateOrderStatus(context: ReturnContext): Promise<ReturnContext> {
    const order = requireOrder(context);
    const updated = await this.orders.updateOrderStatus({
      orderId: order.id,
      status: OrderStatus.Returned,
    });

    return withReturnUpdatedOrder(context, updated);
  }

  private async stepSendNotifications(context: ReturnContext): Promise<ReturnContext> {
    const order = requireUpdatedOrder(context);

    await this.notifications.sendOrderStatusChanged({
      orderId: order.id,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      status: order.status,
    });

    return context;
  }

  private stepBuildResult(context: ReturnContext): ReturnResult {
    const order = requireUpdatedOrder(context);
    const returnRequest = requireReturnRequest(context);
    const returnedItems = requireReturnedItems(context);

    return createReturnResult({
      orderId: order.id,
      orderStatus: order.status,
      returnRequest,
      returnedItems,
    });
  }
}

function requireOrder(context: ReturnContext) {
  if (!context.order) {
    throw new Error("Order is required for return.");
  }
  return context.order;
}

function requireUpdatedOrder(context: ReturnContext) {
  if (!context.updatedOrder) {
    throw new Error("Updated order is required for return.");
  }
  return context.updatedOrder;
}

function requireReturnRequest(context: ReturnContext) {
  if (!context.returnRequest) {
    throw new Error("Return request is required.");
  }
  return context.returnRequest;
}

function requireReturnedItems(context: ReturnContext) {
  if (!context.returnedItems) {
    throw new Error("Returned items are required.");
  }
  return context.returnedItems;
}
