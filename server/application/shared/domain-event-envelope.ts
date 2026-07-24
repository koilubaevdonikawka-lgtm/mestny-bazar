/** Normalized domain event envelope for the application event bus. */
export interface ApplicationDomainEvent {
  readonly eventName: string;
  readonly occurredAt: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type ApplicationDomainEventHandler = (
  event: ApplicationDomainEvent,
) => void | Promise<void>;

export interface EventSubscription {
  readonly id: string;
  unsubscribe(): void;
}
