/** Base class for all seller domain events. */
export abstract class DomainEvent {
  abstract readonly eventName: string;

  protected constructor(readonly occurredAt: string) {}
}
