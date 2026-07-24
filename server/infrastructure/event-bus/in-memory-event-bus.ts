import type { IEventBus } from "@server/application/ports";
import type {
  ApplicationDomainEvent,
  ApplicationDomainEventHandler,
  EventSubscription,
} from "@server/application/shared";

interface SubscriptionRecord {
  id: string;
  eventName: string;
  handler: ApplicationDomainEventHandler;
}

class InMemoryEventSubscription implements EventSubscription {
  constructor(
    readonly id: string,
    private readonly dispose: () => void,
  ) {}

  unsubscribe(): void {
    this.dispose();
  }
}

/** In-memory event bus with multi-subscriber support. */
export class InMemoryEventBus implements IEventBus {
  private readonly subscriptions = new Map<string, SubscriptionRecord[]>();
  private subscriptionCounter = 0;

  async publish(event: ApplicationDomainEvent): Promise<void> {
    await this.publishAll([event]);
  }

  async publishAll(events: readonly ApplicationDomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this.subscriptions.get(event.eventName) ?? [];
      for (const record of handlers) {
        await record.handler(event);
      }
    }
  }

  subscribe(
    eventName: string,
    handler: ApplicationDomainEventHandler,
  ): EventSubscription {
    const id = `sub-${++this.subscriptionCounter}`;
    const record: SubscriptionRecord = { id, eventName, handler };
    const existing = this.subscriptions.get(eventName) ?? [];
    this.subscriptions.set(eventName, [...existing, record]);

    return new InMemoryEventSubscription(id, () => {
      this.removeSubscription(eventName, id);
    });
  }

  unsubscribe(subscription: EventSubscription): void {
    subscription.unsubscribe();
  }

  private removeSubscription(eventName: string, subscriptionId: string): void {
    const handlers = this.subscriptions.get(eventName);
    if (!handlers) {
      return;
    }

    const next = handlers.filter((record) => record.id !== subscriptionId);
    if (next.length === 0) {
      this.subscriptions.delete(eventName);
      return;
    }

    this.subscriptions.set(eventName, next);
  }
}
