import type { IEventBus } from "@server/application/ports";
import type {
  ApplicationDomainEvent,
  ApplicationDomainEventHandler,
  EventSubscription,
} from "@server/application/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, SupabaseSnapshotTables } from "@server/infrastructure/supabase/shared";

interface SubscriptionRecord {
  id: string;
  eventName: string;
  handler: ApplicationDomainEventHandler;
}

class SupabaseEventSubscription implements EventSubscription {
  constructor(
    readonly id: string,
    private readonly dispose: () => void,
  ) {}

  unsubscribe(): void {
    this.dispose();
  }
}

/**
 * Persists domain events to Supabase and dispatches in-process subscribers.
 * Distributed cross-process subscriptions require a future polling/realtime adapter.
 */
export class SupabaseEventPublisher implements IEventBus {
  private readonly subscriptions = new Map<string, SubscriptionRecord[]>();
  private subscriptionCounter = 0;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {
    Object.freeze(this);
  }

  async publish(event: ApplicationDomainEvent): Promise<void> {
    await this.publishAll([event]);
  }

  async publishAll(events: readonly ApplicationDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.persistEvent(event);

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

    return new SupabaseEventSubscription(id, () => {
      this.removeSubscription(eventName, id);
    });
  }

  unsubscribe(subscription: EventSubscription): void {
    subscription.unsubscribe();
  }

  private async persistEvent(event: ApplicationDomainEvent): Promise<void> {
    const client = this.clientProvider.getServiceClient();
    const table =
      this.configuration.schema === "public"
        ? client.from(SupabaseSnapshotTables.domainEvents)
        : client.schema(this.configuration.schema).from(SupabaseSnapshotTables.domainEvents);

    assertSupabaseSuccess(
      `${SupabaseSnapshotTables.domainEvents}.insert`,
      await table.insert({
        event_name: event.eventName,
        aggregate_id: event.aggregateId,
        aggregate_type: event.aggregateType,
        payload: event.payload,
        occurred_at: event.occurredAt,
      }),
    );
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
