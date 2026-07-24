import type { ApplicationDomainEvent } from "@server/application/shared";
import type { IEventBus } from "@server/application/ports";

export interface DomainEventSource {
  pullDomainEvents(): readonly unknown[];
}

interface NormalizableDomainEvent {
  eventName: string;
  occurredAt: string;
  [key: string]: unknown;
}

/** Maps aggregate domain events to the application bus and publishes them. */
export class DomainEventDispatcher {
  constructor(private readonly eventBus: IEventBus) {}

  async dispatchFrom(source: DomainEventSource, aggregateType: string): Promise<void> {
    const events = source.pullDomainEvents();
    if (events.length === 0) {
      return;
    }

    const envelopes = events.map((event) =>
      this.normalize(event, aggregateType),
    );
    await this.eventBus.publishAll(envelopes);
  }

  async dispatch(events: readonly unknown[], aggregateType: string): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const envelopes = events.map((event) => this.normalize(event, aggregateType));
    await this.eventBus.publishAll(envelopes);
  }

  private normalize(event: unknown, aggregateType: string): ApplicationDomainEvent {
    if (!this.isNormalizable(event)) {
      throw new Error("Domain event must expose eventName and occurredAt");
    }

    const aggregateId = this.extractAggregateId(event, aggregateType);
    const payload = this.extractPayload(event);

    return Object.freeze({
      eventName: event.eventName,
      occurredAt: event.occurredAt,
      aggregateId,
      aggregateType,
      payload: Object.freeze(payload),
    });
  }

  private isNormalizable(event: unknown): event is NormalizableDomainEvent {
    return (
      typeof event === "object" &&
      event !== null &&
      "eventName" in event &&
      typeof (event as NormalizableDomainEvent).eventName === "string" &&
      "occurredAt" in event &&
      typeof (event as NormalizableDomainEvent).occurredAt === "string"
    );
  }

  private extractPayload(event: NormalizableDomainEvent): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if ("payload" in event) {
      const nested = (event as { payload?: unknown }).payload;
      if (nested !== undefined) {
        payload.payload = nested;
      }
    }

    return payload;
  }

  private extractAggregateId(event: NormalizableDomainEvent, aggregateType: string): string {
    if (typeof event.orderId === "string") {
      return event.orderId;
    }
    if (typeof event.productId === "string") {
      return event.productId;
    }
    if (typeof event.sellerId === "string") {
      return event.sellerId;
    }
    if (typeof event.catalogId === "string" && aggregateType === "Catalog") {
      return event.catalogId;
    }
    if (typeof event.categoryId === "string") {
      return event.categoryId;
    }
    if (typeof event.catalogId === "string") {
      return event.catalogId;
    }

    throw new Error(`Unable to extract aggregate id from ${aggregateType} domain event`);
  }
}
