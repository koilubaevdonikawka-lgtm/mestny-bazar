import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import type { IOrderStatusChangeHook } from "@server/application/modules/order/order/contracts/order-status-change-hook.contract";
import type { Order, OrderStatus } from "@server/application/modules/order/order/models";
import type { IOrderTimelineStore } from "@server/application/order-lifecycle/contracts/order-timeline-store.contract";
import {
  createOrderTimelineEntry,
  createOrderTimeline,
  type OrderTimeline,
} from "@server/application/order-lifecycle/models/order-timeline-entry.model";
import { resolveOrderStatusLabel } from "@server/application/order-lifecycle/models/order-status-transition.policy";
import type { IIdGenerator } from "@server/application/ports";

/** Records timeline entries and sends customer notifications on status changes. */
export class OrderStatusChangeRecorder implements IOrderStatusChangeHook {
  constructor(
    private readonly timelineStore: IOrderTimelineStore,
    private readonly notifications: NotificationModule,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async onOrderCreated(order: Order): Promise<void> {
    await this.timelineStore.appendEntry(
      createOrderTimelineEntry({
        id: this.idGenerator.generate(),
        orderId: order.id,
        status: order.status,
        previousStatus: null,
        label: resolveOrderStatusLabel(order.status),
        occurredAt: order.createdAt,
      }),
    );
  }

  async onStatusChanged(input: {
    order: Order;
    previousStatus: OrderStatus;
    reason?: string | null;
    actor?: string | null;
  }): Promise<void> {
    if (input.previousStatus === input.order.status) {
      return;
    }

    await this.timelineStore.appendEntry(
      createOrderTimelineEntry({
        id: this.idGenerator.generate(),
        orderId: input.order.id,
        status: input.order.status,
        previousStatus: input.previousStatus,
        label: resolveOrderStatusLabel(input.order.status),
        reason: input.reason,
        actor: input.actor,
      }),
    );

    await this.notifications.sendOrderStatusChanged({
      orderId: input.order.id,
      customerId: input.order.customerId,
      orderNumber: input.order.orderNumber,
      status: input.order.status,
      totalAmount: input.order.totals.total.amount,
      currency: input.order.totals.total.currency,
    });
  }
}

/** Read model service for order timeline. */
export class OrderTimelineService {
  constructor(private readonly timelineStore: IOrderTimelineStore) {}

  async getTimeline(orderId: string): Promise<OrderTimeline> {
    const entries = await this.timelineStore.findByOrderId(orderId.trim());
    const sorted = [...entries].sort((left, right) =>
      left.occurredAt.localeCompare(right.occurredAt),
    );
    return createOrderTimeline(orderId, Object.freeze(sorted));
  }
}
