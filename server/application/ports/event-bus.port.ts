import type {
  ApplicationDomainEvent,
  ApplicationDomainEventHandler,
  EventSubscription,
} from "@server/application/shared";

/** Application-layer event bus port. */
export interface IEventBus {
  publish(event: ApplicationDomainEvent): Promise<void>;
  publishAll(events: readonly ApplicationDomainEvent[]): Promise<void>;
  subscribe(
    eventName: string,
    handler: ApplicationDomainEventHandler,
  ): EventSubscription;
  unsubscribe(subscription: EventSubscription): void;
}
