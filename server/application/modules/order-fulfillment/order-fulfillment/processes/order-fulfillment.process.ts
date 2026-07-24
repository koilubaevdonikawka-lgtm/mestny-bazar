import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import { OrderStatus } from "@server/application/modules/order/order/models";
import type { StartFulfillmentDto } from "@server/application/modules/order-fulfillment/order-fulfillment/dto";
import {
  createFulfillmentContext,
  createFulfillmentRequest,
  createFulfillmentResult,
  createReservedStockLine,
  type FulfillmentContext,
  type FulfillmentResult,
  withFulfillmentOrder,
  withFulfillmentPayment,
  withFulfillmentReservedItems,
  withFulfillmentUpdatedOrder,
  withFulfillmentWarehouseTask,
} from "@server/application/modules/order-fulfillment/order-fulfillment/models";
import type { InventoryModule } from "@server/application/modules/inventory/inventory/api/inventory.module";
import type { PaymentModule } from "@server/application/modules/payment/payment/api/payment.module";
import {
  isFailedPaymentStatus,
  isSuccessfulPaymentStatus,
  PaymentStatus,
} from "@server/application/modules/payment/payment/models";
import type { WarehouseModule } from "@server/application/modules/warehouse/warehouse/api/warehouse.module";

/** Order fulfillment business process orchestrator — coordinates capability modules through public APIs. */
export class OrderFulfillmentProcess {
  constructor(
    private readonly orders: OrderModule,
    private readonly payments: PaymentModule,
    private readonly inventory: InventoryModule,
    private readonly notifications: NotificationModule,
    private readonly warehouse: WarehouseModule,
  ) {}

  async execute(input: StartFulfillmentDto): Promise<FulfillmentResult> {
    let state = createFulfillmentContext(createFulfillmentRequest(input));
    state = await this.stepLoadOrder(state);
    state = await this.stepConfirmPayment(state);
    state = await this.stepReserveStock(state);
    state = await this.stepCommitReservations(state);
    state = await this.stepUpdateOrderStatus(state);
    state = await this.stepCreateWarehouseTask(state);
    state = await this.stepSendNotifications(state);
    return this.stepBuildResult(state);
  }

  private async stepLoadOrder(context: FulfillmentContext): Promise<FulfillmentContext> {
    const order = await this.orders.getOrder(context.request.orderId);
    if (!order) {
      throw new Error(`Order not found: ${context.request.orderId}`);
    }
    return withFulfillmentOrder(context, order);
  }

  private async stepConfirmPayment(context: FulfillmentContext): Promise<FulfillmentContext> {
    const payment = await this.payments.getPayment(context.request.paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${context.request.paymentId}`);
    }

    const order = requireOrder(context);
    if (payment.orderId !== order.id) {
      throw new Error("Payment does not belong to the requested order.");
    }

    if (isFailedPaymentStatus(payment.status)) {
      throw new Error(`Payment ${payment.id} is not eligible for fulfillment.`);
    }

    let confirmed = payment;
    if (!isSuccessfulPaymentStatus(payment.status)) {
      confirmed = await this.payments.updatePaymentStatus({
        paymentId: payment.id,
        status: PaymentStatus.Succeeded,
      });
    }

    return withFulfillmentPayment(context, confirmed);
  }

  private async stepReserveStock(context: FulfillmentContext): Promise<FulfillmentContext> {
    const order = requireOrder(context);
    const reservedItems = [];

    for (const item of order.items) {
      const previousStock = await this.inventory.getAvailableQuantity(item.productId);
      if (previousStock === null) {
        throw new Error(`Inventory is unavailable for product ${item.productId}.`);
      }

      const reservation = await this.inventory.reserve({
        productId: item.productId,
        quantity: item.quantity,
        referenceId: order.id,
      });

      const remainingStock = await this.inventory.getAvailableQuantity(item.productId);

      reservedItems.push(
        createReservedStockLine({
          reservationId: reservation.id,
          productId: item.productId,
          sellerId: item.sellerId,
          name: item.name,
          quantity: item.quantity,
          previousStock,
          remainingStock: remainingStock ?? 0,
        }),
      );
    }

    return withFulfillmentReservedItems(context, Object.freeze(reservedItems));
  }

  private async stepCommitReservations(context: FulfillmentContext): Promise<FulfillmentContext> {
    const reservedItems = requireReservedItems(context);

    for (const item of reservedItems) {
      await this.inventory.commitReservation({
        reservationId: item.reservationId,
      });
    }

    return context;
  }

  private async stepUpdateOrderStatus(context: FulfillmentContext): Promise<FulfillmentContext> {
    const order = requireOrder(context);
    let updated = order;

    if (updated.status !== OrderStatus.Paid) {
      updated = await this.orders.updateOrderStatus({
        orderId: order.id,
        status: OrderStatus.Paid,
      });
    }

    if (updated.status !== OrderStatus.Preparing) {
      updated = await this.orders.updateOrderStatus({
        orderId: order.id,
        status: OrderStatus.Preparing,
      });
    }

    return withFulfillmentUpdatedOrder(context, updated);
  }

  private async stepCreateWarehouseTask(context: FulfillmentContext): Promise<FulfillmentContext> {
    const order = requireUpdatedOrder(context);
    const task = await this.warehouse.createTask({
      orderId: order.id,
      items: Object.freeze(
        order.items.map((item) =>
          Object.freeze({
            productId: item.productId,
            sellerId: item.sellerId,
            name: item.name,
            quantity: item.quantity,
          }),
        ),
      ),
    });

    return withFulfillmentWarehouseTask(context, task);
  }

  private async stepSendNotifications(context: FulfillmentContext): Promise<FulfillmentContext> {
    const order = requireUpdatedOrder(context);

    await this.notifications.sendPaymentSucceeded({
      orderId: order.id,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      totalAmount: order.totals.total.amount,
      currency: order.totals.total.currency,
    });

    await this.notifications.sendOrderStatusChanged({
      orderId: order.id,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      status: order.status,
    });

    return context;
  }

  private stepBuildResult(context: FulfillmentContext): FulfillmentResult {
    const order = requireUpdatedOrder(context);
    const payment = requirePayment(context);
    const warehouseTask = requireWarehouseTask(context);
    const reservedItems = requireReservedItems(context);

    return createFulfillmentResult({
      orderId: order.id,
      paymentId: payment.id,
      orderStatus: order.status,
      paymentStatus: payment.status,
      warehouseTask,
      reservedItems,
    });
  }
}

function requireOrder(context: FulfillmentContext) {
  if (!context.order) {
    throw new Error("Order is required for fulfillment.");
  }
  return context.order;
}

function requirePayment(context: FulfillmentContext) {
  if (!context.payment) {
    throw new Error("Payment is required for fulfillment.");
  }
  return context.payment;
}

function requireUpdatedOrder(context: FulfillmentContext) {
  if (!context.updatedOrder) {
    throw new Error("Updated order is required for fulfillment.");
  }
  return context.updatedOrder;
}

function requireWarehouseTask(context: FulfillmentContext) {
  if (!context.warehouseTask) {
    throw new Error("Warehouse task is required for fulfillment.");
  }
  return context.warehouseTask;
}

function requireReservedItems(context: FulfillmentContext) {
  if (!context.reservedItems) {
    throw new Error("Reserved stock lines are required for fulfillment.");
  }
  return context.reservedItems;
}
