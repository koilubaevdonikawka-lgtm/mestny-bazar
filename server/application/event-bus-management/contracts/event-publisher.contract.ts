import type { PublishedEvent } from "@server/application/event-bus-management/models/event.model";

export interface IEventPublisher {
  publish(event: PublishedEvent): Promise<PublishedEvent>;
}
