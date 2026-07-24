import type { CourierModule } from "@server/application/modules/courier/courier/api/courier.module";
import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import { OrderStatus } from "@server/application/modules/order/order/models";
import type { StartDeliveryDto } from "@server/application/modules/delivery/delivery/dto";
import {
  createDeliveryContext,
  createDeliveryRequest,
  createDeliveryResult,
  createDeliveryTask,
  type DeliveryContext,
  type DeliveryResult,
  withDeliveryCourierAssignment,
  withDeliveryOrder,
  withDeliveryTask,
  withDeliveryUpdatedOrder,
} from "@server/application/modules/delivery/delivery/models";

const DELIVERY_READY_STATUSES = new Set<string>([
  OrderStatus.Preparing,
  OrderStatus.ReadyForDelivery,
]);

/** Delivery business process orchestrator — coordinates capability modules through public APIs. */
export class DeliveryProcess {
  constructor(
    private readonly orders: OrderModule,
    private readonly notifications: NotificationModule,
    private readonly couriers: CourierModule,
  ) {}

  async execute(input: StartDeliveryDto): Promise<DeliveryResult> {
    let state = createDeliveryContext(createDeliveryRequest(input));
    state = await this.stepLoadOrder(state);
    state = this.stepVerifyOrderReady(state);
    state = await this.stepAssignCourier(state);
    state = await this.stepUpdateOrderStatus(state);
    state = await this.stepStartCourierDelivery(state);
    state = this.stepCreateDeliveryTask(state);
    state = await this.stepSendNotifications(state);
    return this.stepBuildResult(state);
  }

  private async stepLoadOrder(context: DeliveryContext): Promise<DeliveryContext> {
    const order = await this.orders.getOrder(context.request.orderId);
    if (!order) {
      throw new Error(`Order not found: ${context.request.orderId}`);
    }
    return withDeliveryOrder(context, order);
  }

  private stepVerifyOrderReady(context: DeliveryContext): DeliveryContext {
    const order = requireOrder(context);

    if (!DELIVERY_READY_STATUSES.has(order.status)) {
      throw new Error(
        `Order ${order.id} is not ready for delivery. Current status: ${order.status}.`,
      );
    }

    if (!order.address.trim() || !order.phone.trim()) {
      throw new Error(`Order ${order.id} is missing delivery contact details.`);
    }

    return context;
  }

  private async stepAssignCourier(context: DeliveryContext): Promise<DeliveryContext> {
    const order = requireOrder(context);
    const courierAssignment = await this.couriers.assignCourier({
      courierId: context.request.courierId,
      orderId: order.id,
      address: order.address,
      phone: order.phone,
    });

    return withDeliveryCourierAssignment(context, courierAssignment);
  }

  private async stepUpdateOrderStatus(context: DeliveryContext): Promise<DeliveryContext> {
    const order = requireOrder(context);
    let updated = order;

    if (updated.status === OrderStatus.Preparing) {
      updated = await this.orders.updateOrderStatus({
        orderId: order.id,
        status: OrderStatus.ReadyForDelivery,
      });
    }

    if (updated.status !== OrderStatus.Delivering) {
      updated = await this.orders.updateOrderStatus({
        orderId: order.id,
        status: OrderStatus.Delivering,
      });
    }

    return withDeliveryUpdatedOrder(context, updated);
  }

  private async stepStartCourierDelivery(context: DeliveryContext): Promise<DeliveryContext> {
    const courierAssignment = requireCourierAssignment(context);
    const updatedAssignment = await this.couriers.startDelivery(courierAssignment.id);
    return withDeliveryCourierAssignment(context, updatedAssignment);
  }

  private stepCreateDeliveryTask(context: DeliveryContext): DeliveryContext {
    const order = requireUpdatedOrder(context);
    const courierAssignment = requireCourierAssignment(context);
    const deliveryTask = createDeliveryTask({
      id: `dlv-${order.id}`,
      orderId: order.id,
      courierId: courierAssignment.courierId,
      address: order.address,
      phone: order.phone,
    });

    return withDeliveryTask(context, deliveryTask);
  }

  private async stepSendNotifications(context: DeliveryContext): Promise<DeliveryContext> {
    const order = requireUpdatedOrder(context);

    await this.notifications.sendOrderStatusChanged({
      orderId: order.id,
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      status: order.status,
    });

    return context;
  }

  private stepBuildResult(context: DeliveryContext): DeliveryResult {
    const order = requireUpdatedOrder(context);
    const courierAssignment = requireCourierAssignment(context);
    const deliveryTask = requireDeliveryTask(context);

    return createDeliveryResult({
      orderId: order.id,
      orderStatus: order.status,
      courierAssignment,
      deliveryTask,
    });
  }
}

function requireOrder(context: DeliveryContext) {
  if (!context.order) {
    throw new Error("Order is required for delivery.");
  }
  return context.order;
}

function requireUpdatedOrder(context: DeliveryContext) {
  if (!context.updatedOrder) {
    throw new Error("Updated order is required for delivery.");
  }
  return context.updatedOrder;
}

function requireCourierAssignment(context: DeliveryContext) {
  if (!context.courierAssignment) {
    throw new Error("Courier assignment is required for delivery.");
  }
  return context.courierAssignment;
}

function requireDeliveryTask(context: DeliveryContext) {
  if (!context.deliveryTask) {
    throw new Error("Delivery task is required.");
  }
  return context.deliveryTask;
}
