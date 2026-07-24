import type { AnalyticsService } from "@server/application/modules/analytics/analytics/services/analytics.service";
import { ANALYTICS_CAPABILITY_EVENT_NAMES } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { IEventBus } from "@server/application/ports";
import type { EventSubscription } from "@server/application/shared";

/** Subscribes Analytics projections to capability domain events on the event bus. */
export class AnalyticsEventSubscriber {
  private subscriptions: EventSubscription[] = [];

  subscribe(eventBus: IEventBus, analytics: AnalyticsService): void {
    this.unsubscribe();

    for (const eventName of ANALYTICS_CAPABILITY_EVENT_NAMES) {
      const subscription = eventBus.subscribe(eventName, async (event) => {
        await analytics.handleDomainEvent(event);
      });
      this.subscriptions.push(subscription);
    }
  }

  unsubscribe(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions = [];
  }
}
