import { describe, expect, it, vi } from "vitest";
import { subscribePushNotifications } from "@server/domain/push/marketplace-events.subscriber";
import { MarketplaceEventsService } from "@server/domain/marketplace-events/marketplace-events.service";
import type { IPushNotifier, PushNotificationPayload } from "@server/ports/push-notifier.port";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    userId: "buyer-1",
    orderNumber: 42,
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

function fakePushNotifier(): IPushNotifier & {
  calls: Array<{ userId: string; payload: PushNotificationPayload }>;
} {
  const calls: Array<{ userId: string; payload: PushNotificationPayload }> = [];
  return {
    calls,
    sendToUser: vi.fn(async (userId: string, payload: PushNotificationPayload) => {
      calls.push({ userId, payload });
    }),
  };
}

describe("subscribePushNotifications", () => {
  it.each([
    ["order.confirmed", "Заказ подтверждён"],
    ["courier.assigned", "Курьер назначен"],
    ["order.out_for_delivery", "Курьер в пути"],
    ["order.delivered", "Заказ доставлен"],
    ["order.cancelled", "Заказ отменён"],
  ] as const)("sends a push with title %s -> %s on %s", async (eventType, expectedTitle) => {
    const bus = new MarketplaceEventsService();
    const push = fakePushNotifier();
    subscribePushNotifications(bus, push);
    const order = makeOrder();

    if (eventType === "courier.assigned") {
      await bus.publish({ type: eventType, order, courierId: "courier-1" });
    } else if (eventType === "order.cancelled") {
      await bus.publish({ type: eventType, order, reason: "customer request" });
    } else {
      await bus.publish({ type: eventType, order });
    }

    expect(push.calls).toHaveLength(1);
    expect(push.calls[0].userId).toBe("buyer-1");
    expect(push.calls[0].payload.title).toBe(expectedTitle);
    expect(push.calls[0].payload.body).toContain("42");
    expect(push.calls[0].payload.data).toEqual({
      orderId: "order-1",
      orderNumber: "42",
      status: order.status,
    });
  });

  it("skips push for a guest order (userId: null) without calling the notifier", async () => {
    const bus = new MarketplaceEventsService();
    const push = fakePushNotifier();
    subscribePushNotifications(bus, push);

    await bus.publish({ type: "order.confirmed", order: makeOrder({ userId: null }) });

    expect(push.calls).toHaveLength(0);
  });

  it.each([
    "order.created",
    "order.assembling_started",
    "order.ready_for_delivery",
    "order.arrived",
    "order.paid",
  ] as const)(
    "does not send push on %s (too granular, not in the approved list)",
    async (eventType) => {
      const bus = new MarketplaceEventsService();
      const push = fakePushNotifier();
      subscribePushNotifications(bus, push);

      await bus.publish({ type: eventType, order: makeOrder() });

      expect(push.calls).toHaveLength(0);
    },
  );
});
