import type {
  IMarketplaceEventBus,
  MarketplaceEvent,
  MarketplaceEventHandler,
  MarketplaceEventType,
} from "@server/ports/marketplace-events.port";
import { logger } from "@shared/observability/logger";

/** In-memory marketplace event bus — single process, no external broker. */
export class MarketplaceEventsService implements IMarketplaceEventBus {
  private readonly handlers = new Map<MarketplaceEventType, Set<MarketplaceEventHandler>>();

  subscribe<T extends MarketplaceEventType>(
    eventType: T,
    handler: MarketplaceEventHandler<T>,
  ): void {
    const existing = this.handlers.get(eventType);
    const bucket = existing ?? new Set<MarketplaceEventHandler>();
    bucket.add(handler as unknown as MarketplaceEventHandler);
    if (!existing) {
      this.handlers.set(eventType, bucket);
    }
  }

  async publish(event: MarketplaceEvent): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) {
      return;
    }
    // Subscribers (notifications, AI workers, audit log) are side effects of the
    // event, not part of the publisher's own transaction — one throwing must never
    // fail the publish call itself, or every future subscriber to an event type
    // becomes a hidden way to break whatever business operation publishes it (e.g.
    // a stub notification adapter throwing would otherwise fail checkout()).
    const results = await Promise.allSettled([...handlers].map((handler) => handler(event)));
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Event handler failed", { eventType: event.type, error: result.reason });
      }
    }
  }
}
