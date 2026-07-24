import type { INotificationCenter } from "@server/ports/notification-center.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";

/** Registers Notification Center as a marketplace event subscriber. */
export function subscribeNotificationCenter(
  bus: IMarketplaceEventBus,
  center: INotificationCenter,
): void {
  bus.subscribe("order.created", async (event) => {
    await center.dispatch({ type: "order.created", order: event.order });
  });
}
