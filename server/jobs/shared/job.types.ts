/** Base class for job lifecycle domain events. */
export abstract class JobEvent {
  abstract readonly eventName: string;
  readonly occurredAt: string;

  protected constructor(occurredAt?: string) {
    this.occurredAt = occurredAt ?? new Date().toISOString();
  }
}
