import { describe, expect, it, vi } from "vitest";
import { subscribeNotificationCenter } from "@server/domain/marketplace-events/notification-center.subscriber";
import { MarketplaceEventsService } from "@server/domain/marketplace-events/marketplace-events.service";
import type {
  INotificationCenter,
  NotificationEvent,
} from "@server/ports/notification-center.port";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: "CREATED",
    paymentStatus: "unpaid",
    paymentMethod: "CASH",
    subtotal: 100,
    deliveryFee: 0,
    discountAmount: 0,
    couponCode: null,
    total: 100,
    currency: "KGS",
    customerName: "Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "addr",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: null,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    ...overrides,
  };
}

function fakeNotificationCenter(): INotificationCenter & { dispatched: NotificationEvent[] } {
  const dispatched: NotificationEvent[] = [];
  return {
    dispatched,
    dispatch: vi.fn(async (event: NotificationEvent) => {
      dispatched.push(event);
    }),
    subscribe: vi.fn(async () => {}),
  };
}

describe("subscribeNotificationCenter", () => {
  it("dispatches order.created to the Notification Center when order.operational_cascade_started fires", async () => {
    const bus = new MarketplaceEventsService();
    const center = fakeNotificationCenter();
    subscribeNotificationCenter(bus, center);
    const order = makeOrder();

    await bus.publish({ type: "order.operational_cascade_started", order });

    expect(center.dispatched).toEqual([{ type: "order.created", order }]);
  });

  it("does NOT dispatch on the immediate order.created bus event — staff notification must wait for the buffer (ADMIN_PLATFORM_MASTER_SPEC.md §9.5)", async () => {
    const bus = new MarketplaceEventsService();
    const center = fakeNotificationCenter();
    subscribeNotificationCenter(bus, center);

    await bus.publish({ type: "order.created", order: makeOrder() });

    expect(center.dispatched).toHaveLength(0);
  });
});
