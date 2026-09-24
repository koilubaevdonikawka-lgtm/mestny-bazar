import type { INotificationCenter } from "@server/ports/notification-center.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";

/**
 * Registers Notification Center as a marketplace event subscriber.
 *
 * Задача №312 — subscribes to order.created, not
 * order.operational_cascade_started: the owner explicitly chose instant
 * staff notification at the moment an order is placed, even though the
 * buyer can still cancel it within the 2-minute buffer (a deliberate
 * departure from ADMIN_PLATFORM_MASTER_SPEC.md §9.5 / platform-lifecycle.md
 * §3, which gated notification on that buffer). For an ONLINE order this
 * also means before payment is confirmed. The cascade event itself is
 * unchanged and still fires for Audit Log. Exactly-once per order comes from
 * CheckoutService publishing order.created only for the request that
 * actually inserted the order (IOrderRepository.create's `created` flag).
 */
export function subscribeNotificationCenter(
  bus: IMarketplaceEventBus,
  center: INotificationCenter,
): void {
  bus.subscribe("order.created", async (event) => {
    await center.dispatch({ type: "order.created", order: event.order });
  });
}
