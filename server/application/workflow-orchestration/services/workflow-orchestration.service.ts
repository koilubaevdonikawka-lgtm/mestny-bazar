/**
 * Workflow Orchestration — coordinates Application Modules only.
 *
 * No domain business logic. No Repository or Infrastructure access.
 * All steps delegated to workflow ports backed by Application Services.
 */
import type { ICheckoutWorkflowReader } from "@server/application/workflow-orchestration/contracts/checkout-workflow-reader.contract";
import type { IDeliveryWorkflowService } from "@server/application/workflow-orchestration/contracts/delivery-workflow-service.contract";
import type { INotificationWorkflowService } from "@server/application/workflow-orchestration/contracts/notification-workflow-service.contract";
import type { IOrderWorkflowService } from "@server/application/workflow-orchestration/contracts/order-workflow-service.contract";
import type { IPaymentWorkflowService } from "@server/application/workflow-orchestration/contracts/payment-workflow-service.contract";
import type { IWarehouseWorkflowService } from "@server/application/workflow-orchestration/contracts/warehouse-workflow-service.contract";
import type {
  CancelOrderWorkflowResult,
  DeliveryCompletedWorkflowResult,
  PaymentFailedWorkflowResult,
  PaymentSucceededWorkflowResult,
  PlaceOrderWorkflowResult,
  WarehouseCompletedWorkflowResult,
} from "@server/application/workflow-orchestration/models/workflow-result.model";

export class WorkflowOrchestrationService {
  constructor(
    private readonly checkoutReader: ICheckoutWorkflowReader,
    private readonly orders: IOrderWorkflowService,
    private readonly payments: IPaymentWorkflowService,
    private readonly warehouse: IWarehouseWorkflowService,
    private readonly delivery: IDeliveryWorkflowService,
    private readonly notifications: INotificationWorkflowService,
  ) {}

  async placeOrder(customerId: string, checkoutId: string): Promise<PlaceOrderWorkflowResult> {
    const checkout = await this.checkoutReader.validateForOrder(customerId, checkoutId);
    if (!checkout.valid || !checkout.ready) {
      throw new Error("Checkout is not ready for order placement.");
    }

    const order = await this.orders.createFromCheckout(customerId, checkoutId);
    const payment = await this.payments.createForOrder(customerId, order.orderId);

    await this.notifications.notify(customerId, "order.created", {
      orderId: order.orderId,
    });

    return Object.freeze({
      checkoutId,
      orderId: order.orderId,
      paymentId: payment.paymentId,
      customerId,
      stage: "awaiting_payment",
    });
  }

  async handlePaymentSucceeded(paymentId: string): Promise<PaymentSucceededWorkflowResult> {
    const payment = await this.requirePayment(paymentId);
    await this.payments.confirmPayment(paymentId);
    await this.orders.confirmOrder(payment.orderId);

    const picking = await this.warehouse.createPickingTask(payment.orderId);

    await this.notifications.notify(payment.customerId, "payment.succeeded", {
      orderId: payment.orderId,
    });

    return Object.freeze({
      paymentId,
      orderId: payment.orderId,
      pickingTaskId: picking.taskId,
      stage: "warehouse_picking",
    });
  }

  async handlePaymentFailed(paymentId: string, reason?: string): Promise<PaymentFailedWorkflowResult> {
    const payment = await this.requirePayment(paymentId);
    await this.payments.failPayment(paymentId, reason);
    const cancelled = await this.orders.cancelOrder(payment.orderId, payment.customerId, reason);

    await this.notifications.notify(payment.customerId, "generic.message", {
      message: reason ?? "Payment failed. Order cancelled.",
    });

    return Object.freeze({
      paymentId,
      orderId: payment.orderId,
      cancelled,
      stage: "cancelled",
    });
  }

  async handleWarehouseCompleted(taskId: string): Promise<WarehouseCompletedWorkflowResult> {
    const task = await this.requirePickingTask(taskId);
    const completed = await this.warehouse.completePicking(taskId);
    if (!completed) {
      throw new Error(`Failed to complete picking task: ${taskId}`);
    }

    await this.orders.markProcessing(task.orderId);
    const deliveryResult = await this.delivery.createDelivery(task.orderId);
    const order = await this.orders.getOrder(task.orderId);

    if (order) {
      await this.notifications.notify(order.customerId, "generic.message", {
        message: `Order ${task.orderId} is ready for delivery.`,
      });
    }

    return Object.freeze({
      taskId,
      orderId: task.orderId,
      deliveryId: deliveryResult.deliveryId,
      stage: "delivery_pending",
    });
  }

  async handleDeliveryCompleted(deliveryId: string): Promise<DeliveryCompletedWorkflowResult> {
    const deliverySnapshot = await this.requireDelivery(deliveryId);
    const completed = await this.delivery.completeDelivery(deliveryId);
    if (!completed) {
      throw new Error(`Failed to complete delivery: ${deliveryId}`);
    }

    await this.orders.markShipped(deliverySnapshot.orderId);
    await this.orders.markDelivered(deliverySnapshot.orderId);

    await this.notifications.notify(deliverySnapshot.customerId, "generic.message", {
      message: `Order ${deliverySnapshot.orderId} has been delivered.`,
    });

    return Object.freeze({
      deliveryId,
      orderId: deliverySnapshot.orderId,
      stage: "completed",
    });
  }

  async cancelOrder(
    orderId: string,
    customerId: string,
    reason?: string,
  ): Promise<CancelOrderWorkflowResult> {
    const payment = await this.payments.findByOrderId(orderId);
    if (payment && payment.status !== "Cancelled" && payment.status !== "Failed") {
      await this.payments.cancelPayment(payment.paymentId, customerId, reason);
    }

    const pickingTask = await this.warehouse.findTaskByOrderId(orderId);
    if (pickingTask) {
      await this.warehouse.cancelPickingTask(pickingTask.taskId, reason);
    }

    const deliverySnapshot = await this.delivery.findByOrderId(orderId);
    if (deliverySnapshot) {
      await this.delivery.cancelDelivery(deliverySnapshot.deliveryId, customerId, reason);
    }

    const cancelled = await this.orders.cancelOrder(orderId, customerId, reason);

    await this.notifications.notify(customerId, "generic.message", {
      message: reason ?? `Order ${orderId} has been cancelled.`,
    });

    return Object.freeze({
      orderId,
      cancelled,
      stage: "cancelled",
    });
  }

  private async requirePayment(paymentId: string) {
    const payment = await this.payments.getPayment(paymentId);
    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }
    return payment;
  }

  private async requireDelivery(deliveryId: string) {
    const deliverySnapshot = await this.delivery.getDelivery(deliveryId);
    if (!deliverySnapshot) {
      throw new Error(`Delivery not found: ${deliveryId}`);
    }
    return deliverySnapshot;
  }

  private async requirePickingTask(taskId: string) {
    const task = await this.warehouse.getPickingTask(taskId);
    if (!task) {
      throw new Error(`Picking task not found: ${taskId}`);
    }
    return task;
  }
}
