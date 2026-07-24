import type { OrderService } from "@server/application/modules/order/order/services";
import type { CreateOrderDto, UpdateOrderStatusDto } from "@server/application/modules/order/order/dto";
import type { Order } from "@server/application/modules/order/order/models";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Publishes order capability events without modifying OrderService business logic. */
export class EventPublishingOrderService implements Pick<OrderService, "createOrder" | "getOrder" | "updateOrderStatus"> {
  constructor(
    private readonly inner: OrderService,
    private readonly publisher: CapabilityEventPublisher,
  ) {}

  createOrder(dto: CreateOrderDto): Promise<Order> {
    return this.inner.createOrder(dto).then(async (order) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.OrderCreated,
        aggregateId: order.id,
        aggregateType: "Order",
        payload: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          status: order.status,
          itemCount: order.items.length,
          totalAmount: order.totals.total.amount,
          currency: order.totals.total.currency,
        },
      });
      return order;
    });
  }

  getOrder(orderId: string): Promise<Order | null> {
    return this.inner.getOrder(orderId);
  }

  updateOrderStatus(dto: UpdateOrderStatusDto): Promise<Order> {
    return this.inner.updateOrderStatus(dto).then(async (order) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.OrderStatusChanged,
        aggregateId: order.id,
        aggregateType: "Order",
        payload: {
          orderId: order.id,
          status: order.status,
        },
      });
      return order;
    });
  }
}

export function asOrderService(wrapper: EventPublishingOrderService): OrderService {
  return wrapper as unknown as OrderService;
}
