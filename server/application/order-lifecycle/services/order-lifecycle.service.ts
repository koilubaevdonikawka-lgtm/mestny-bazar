import type { ICourierStore } from "@server/application/modules/courier/courier/contracts";
import type { CourierModule } from "@server/application/modules/courier/courier/api/courier.module";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { IPaymentStore } from "@server/application/modules/payment/payment/contracts";
import type { PaymentModule } from "@server/application/modules/payment/payment/api/payment.module";
import { PaymentStatus } from "@server/application/modules/payment/payment/models";
import type { ReturnsModule } from "@server/application/modules/returns/returns/api/returns.module";
import {
  OrderStatus,
  type Order,
  assertOrderStatus,
} from "@server/application/modules/order/order/models";
import { OrderStatusTransitionPolicy } from "@server/application/order-lifecycle/models/order-status-transition.policy";

export interface TransitionOrderInput {
  readonly orderId: string;
  readonly status: string;
  readonly reason?: string | null;
  readonly actor?: string | null;
  readonly courierId?: string | null;
}

/** Orchestrates validated order lifecycle transitions through Order BCM. */
export class OrderLifecycleService {
  private readonly policy = new OrderStatusTransitionPolicy();

  constructor(
    private readonly orders: OrderModule,
    private readonly couriers: CourierModule,
    private readonly courierStore: ICourierStore,
    private readonly payments: PaymentModule,
    private readonly paymentStore: IPaymentStore,
    private readonly returns: ReturnsModule,
  ) {}

  transition(input: TransitionOrderInput): Promise<Order> {
    return this.applyTransition(input);
  }

  async assignCourier(orderId: string, courierId: string, actor?: string | null): Promise<Order> {
    const order = await this.requireOrder(orderId);
    this.policy.assertTransition(order.status, OrderStatus.AssignedToCourier);

    await this.couriers.assignCourier({
      courierId,
      orderId: order.id,
      address: order.address,
      phone: order.phone,
    });

    return this.applyTransition({
      orderId: order.id,
      status: OrderStatus.AssignedToCourier,
      courierId,
      actor: actor ?? courierId,
    });
  }

  acceptDelivery(orderId: string, actor?: string | null): Promise<Order> {
    return this.applyTransition({
      orderId,
      status: OrderStatus.CourierAccepted,
      actor,
    });
  }

  async startDelivery(orderId: string, actor?: string | null): Promise<Order> {
    const order = await this.requireOrder(orderId);
    const assignment = await this.findLatestAssignment(order.id);
    if (assignment) {
      await this.couriers.startDelivery(assignment.id);
    }

    return this.applyTransition({
      orderId,
      status: OrderStatus.OnTheWay,
      actor,
    });
  }

  arriveToCustomer(orderId: string, actor?: string | null): Promise<Order> {
    return this.applyTransition({
      orderId,
      status: OrderStatus.Arrived,
      actor,
    });
  }

  async completeDelivery(orderId: string, actor?: string | null): Promise<Order> {
    const order = await this.requireOrder(orderId);
    if (order.status !== OrderStatus.Arrived) {
      throw new Error(
        `Order must be in Arrived status before delivery completion. Current: ${order.status}`,
      );
    }

    await this.applyTransition({
      orderId,
      status: OrderStatus.Delivered,
      actor,
    });

    return this.applyTransition({
      orderId,
      status: OrderStatus.Completed,
      actor,
    });
  }

  cancelOrder(orderId: string, reason: string, actor?: string | null): Promise<Order> {
    if (!reason.trim()) {
      throw new Error("Cancellation reason is required.");
    }

    return this.applyTransition({
      orderId,
      status: OrderStatus.Cancelled,
      reason,
      actor,
    });
  }

  async returnOrder(orderId: string, reason: string, actor?: string | null): Promise<Order> {
    if (!reason.trim()) {
      throw new Error("Return reason is required.");
    }

    const order = await this.requireOrder(orderId);
    if (order.status !== OrderStatus.Delivered && order.status !== OrderStatus.Completed) {
      throw new Error(`Return is allowed only after delivery. Current status: ${order.status}`);
    }

    await this.returns.processReturn({ orderId, reason });
    return this.requireOrder(orderId);
  }

  async refundOrder(orderId: string, reason: string, actor?: string | null): Promise<Order> {
    if (!reason.trim()) {
      throw new Error("Refund reason is required.");
    }

    const order = await this.requireOrder(orderId);
    if (order.status !== OrderStatus.Returned) {
      throw new Error(`Refund is allowed only after return. Current status: ${order.status}`);
    }

    const payment = await this.paymentStore.findByOrderId(order.id);
    if (payment && payment.status !== PaymentStatus.Refunded) {
      await this.payments.updatePaymentStatus({
        paymentId: payment.id,
        status: PaymentStatus.Refunded,
      });
    }

    return this.applyTransition({
      orderId,
      status: OrderStatus.Refunded,
      reason,
      actor,
    });
  }

  private async applyTransition(input: TransitionOrderInput): Promise<Order> {
    const orderId = input.orderId.trim();
    const nextStatus = assertOrderStatus(input.status);
    const existing = await this.requireOrder(orderId);

    this.policy.assertTransition(existing.status, nextStatus);

    if (
      nextStatus === OrderStatus.Delivered &&
      (existing.status === OrderStatus.Delivered || existing.status === OrderStatus.Completed)
    ) {
      throw new Error("Order has already been delivered.");
    }

    return this.orders.updateOrderStatus({
      orderId,
      status: nextStatus,
      reason: input.reason,
      actor: input.actor,
      courierId: input.courierId,
    });
  }

  private async requireOrder(orderId: string): Promise<Order> {
    const order = await this.orders.getOrder(orderId.trim());
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return order;
  }

  private async findLatestAssignment(orderId: string) {
    const assignments = await this.courierStore.findAssignmentsByOrderId(orderId);
    return assignments.at(-1) ?? null;
  }
}
