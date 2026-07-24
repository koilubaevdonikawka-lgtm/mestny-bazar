import type { IEventDispatcher } from "@server/application/event-bus-management/contracts/event-dispatcher.contract";
import type { IEventSubscriber } from "@server/application/event-bus-management/contracts/event-subscriber.contract";
import type { PublishedEvent } from "@server/application/event-bus-management/models/event.model";

/** Default in-memory event dispatcher — delivers to registered subscribers. */
export class DefaultEventDispatcher implements IEventDispatcher {
  constructor(private readonly eventSubscriber: IEventSubscriber) {}

  async dispatch(event: PublishedEvent): Promise<number> {
    const subscribers = await this.eventSubscriber.findByEventType(event.eventType);
    return subscribers.length;
  }
}
