/** Observability domain event base. */
export abstract class ObservabilityEvent {
  abstract readonly eventName: string;
  readonly occurredAt: string;

  protected constructor(occurredAt?: string) {
    this.occurredAt = occurredAt ?? new Date().toISOString();
  }
}
