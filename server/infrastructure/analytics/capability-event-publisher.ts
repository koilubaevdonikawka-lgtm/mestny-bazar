import type { IEventBus } from "@server/application/ports";
import type { ApplicationDomainEvent } from "@server/application/shared";

/** Publishes capability module events onto the application event bus for Analytics. */
export class CapabilityEventPublisher {
  constructor(private readonly eventBus: IEventBus) {}

  async publish(input: {
    eventName: string;
    aggregateId: string;
    aggregateType: string;
    payload: Readonly<Record<string, unknown>>;
    occurredAt?: string;
  }): Promise<void> {
    const event: ApplicationDomainEvent = Object.freeze({
      eventName: input.eventName,
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      aggregateId: input.aggregateId,
      aggregateType: input.aggregateType,
      payload: input.payload,
    });

    await this.eventBus.publish(event);
  }
}
