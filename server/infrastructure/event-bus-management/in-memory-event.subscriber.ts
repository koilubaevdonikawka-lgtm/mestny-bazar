import type { IEventSubscriber } from "@server/application/event-bus-management/contracts/event-subscriber.contract";
import type { EventSubscription } from "@server/application/event-bus-management/models/event.model";

/** In-memory event subscriber store. */
export class InMemoryEventSubscriber implements IEventSubscriber {
  private readonly subscriptions = new Map<string, EventSubscription>();
  private readonly subscriptionsByType = new Map<string, Set<string>>();

  async subscribe(subscription: EventSubscription): Promise<EventSubscription> {
    this.subscriptions.set(subscription.subscriptionId, subscription);

    const typeSubscriptions =
      this.subscriptionsByType.get(subscription.eventType) ?? new Set<string>();
    typeSubscriptions.add(subscription.subscriptionId);
    this.subscriptionsByType.set(subscription.eventType, typeSubscriptions);

    return subscription;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = await this.findById(subscriptionId);
    if (!subscription) {
      return;
    }

    this.subscriptions.delete(subscriptionId);
    const typeSubscriptions = this.subscriptionsByType.get(subscription.eventType);
    typeSubscriptions?.delete(subscriptionId);
  }

  async findByEventType(eventType: string): Promise<readonly EventSubscription[]> {
    const ids = this.subscriptionsByType.get(eventType.trim());
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((id) => this.subscriptions.get(id))
        .filter((entry): entry is EventSubscription => entry !== undefined),
    );
  }

  async findById(subscriptionId: string): Promise<EventSubscription | null> {
    return this.subscriptions.get(subscriptionId.trim()) ?? null;
  }
}
