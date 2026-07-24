import type { IEventPublisher } from "@server/application/event-bus-management/contracts/event-publisher.contract";
import type { PublishedEvent } from "@server/application/event-bus-management/models/event.model";

/** In-memory event publisher — stores last published events. */
export class InMemoryEventPublisher implements IEventPublisher {
  private readonly published = new Map<string, PublishedEvent>();

  async publish(event: PublishedEvent): Promise<PublishedEvent> {
    this.published.set(event.publicationId, event);
    return event;
  }

  getPublished(publicationId: string): PublishedEvent | null {
    return this.published.get(publicationId.trim()) ?? null;
  }
}
