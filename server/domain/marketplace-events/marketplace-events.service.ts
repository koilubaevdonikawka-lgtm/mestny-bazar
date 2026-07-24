import type {
  IMarketplaceEventBus,
  MarketplaceEvent,
  MarketplaceEventHandler,
  MarketplaceEventType,
} from "@server/ports/marketplace-events.port";

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
    await Promise.all([...handlers].map((handler) => handler(event)));
  }
}
