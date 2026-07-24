import type { EventSubscription } from "@server/application/event-bus-management/models/event.model";

export interface IEventSubscriber {
  subscribe(subscription: EventSubscription): Promise<EventSubscription>;
  unsubscribe(subscriptionId: string): Promise<void>;
  findByEventType(eventType: string): Promise<readonly EventSubscription[]>;
  findById(subscriptionId: string): Promise<EventSubscription | null>;
}
