import type { INotificationCenter } from "@server/ports/notification-center.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";

/**
 * Registers Notification Center as a marketplace event subscriber.
 *
 * Subscribes to order.operational_cascade_started, not order.created: per
 * docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md §9.5 and
 * platform-lifecycle.md §3, staff notification must wait for the 2-minute
 * cancellation buffer to expire — order.created still fires immediately
 * (Audit Log/Dashboard need it right away), but this subscriber must not
 * react to it directly.
 */
export function subscribeNotificationCenter(
  bus: IMarketplaceEventBus,
  center: INotificationCenter,
): void {
  bus.subscribe("order.operational_cascade_started", async (event) => {
    await center.dispatch({ type: "order.created", order: event.order });
  });
}
