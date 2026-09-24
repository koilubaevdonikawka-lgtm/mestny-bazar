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
    userId: null,
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
    deliveryLatitude: null,
    deliveryLongitude: null,
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
  it("dispatches order.created to the Notification Center the moment order.created fires (Задача №312 — no buffer)", async () => {
    const bus = new MarketplaceEventsService();
    const center = fakeNotificationCenter();
    subscribeNotificationCenter(bus, center);
    const order = makeOrder();

    await bus.publish({ type: "order.created", order });

    expect(center.dispatched).toEqual([{ type: "order.created", order }]);
  });

  it("does NOT dispatch again on order.operational_cascade_started — that would notify staff twice per order", async () => {
    const bus = new MarketplaceEventsService();
    const center = fakeNotificationCenter();
    subscribeNotificationCenter(bus, center);

    await bus.publish({ type: "order.operational_cascade_started", order: makeOrder() });

    expect(center.dispatched).toHaveLength(0);
  });
});
