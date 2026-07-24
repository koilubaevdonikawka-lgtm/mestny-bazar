/**
 * Event Bus Management — event publication, subscription, and delivery only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IEventDispatcher } from "@server/application/event-bus-management/contracts/event-dispatcher.contract";
import type { IEventHistoryRepository } from "@server/application/event-bus-management/contracts/event-history-repository.contract";
import type { IEventPublisher } from "@server/application/event-bus-management/contracts/event-publisher.contract";
import type { IEventRepository } from "@server/application/event-bus-management/contracts/event-repository.contract";
import type { IEventSubscriber } from "@server/application/event-bus-management/contracts/event-subscriber.contract";
import {
  createEventDefinition,
  createEventHistoryEntry,
  createEventSubscription,
  createPublishedEvent,
  type ClearEventHistoryResult,
  type EventDefinition,
  type EventHistoryResult,
  type EventSubscription,
  type ListEventsResult,
  type PublishEventInput,
  type PublishedEvent,
  type RegisterEventInput,
  type SubscribeEventInput,
  type UnsubscribeEventInput,
} from "@server/application/event-bus-management/models/event.model";
import type { IIdGenerator } from "@server/application/ports";

export class EventBusManagementService {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly eventSubscriber: IEventSubscriber,
    private readonly eventDispatcher: IEventDispatcher,
    private readonly eventHistoryRepository: IEventHistoryRepository,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerEvent(input: RegisterEventInput): Promise<EventDefinition> {
    const eventType = input.eventType.trim();
    if (!eventType) {
      throw new Error("Event type is required.");
    }

    if (await this.eventRepository.findByType(eventType)) {
      throw new Error(`Event type already registered: ${eventType}`);
    }

    const definition = createEventDefinition({
      eventId: this.idGenerator.generate(),
      eventType,
      description: input.description,
      source: input.source,
    });

    await this.eventRepository.save(definition);
    return definition;
  }

  async publishEvent(input: PublishEventInput): Promise<PublishedEvent> {
    const eventType = input.eventType.trim();
    const definition = await this.eventRepository.findByType(eventType);
    if (!definition) {
      throw new Error(`Event type not registered: ${eventType}`);
    }

    const publicationId = this.idGenerator.generate();
    const draft = createPublishedEvent({
      publicationId,
      eventId: definition.eventId,
      eventType,
      payload: input.payload,
      source: input.source,
      deliveredCount: 0,
    });

    const deliveredCount = await this.eventDispatcher.dispatch(draft);
    const published = createPublishedEvent({
      ...draft,
      deliveredCount,
    });

    await this.eventPublisher.publish(published);
    await this.eventHistoryRepository.save(
      createEventHistoryEntry({
        historyId: this.idGenerator.generate(),
        publicationId: published.publicationId,
        eventId: published.eventId,
        eventType: published.eventType,
        payload: published.payload,
        source: published.source,
        publishedAt: published.publishedAt,
        deliveredCount: published.deliveredCount,
      }),
    );

    return published;
  }

  async subscribeEvent(input: SubscribeEventInput): Promise<EventSubscription> {
    const eventType = input.eventType.trim();
    const subscriberId = input.subscriberId.trim();

    if (!eventType) {
      throw new Error("Event type is required.");
    }
    if (!subscriberId) {
      throw new Error("Subscriber id is required.");
    }

    if (!(await this.eventRepository.findByType(eventType))) {
      throw new Error(`Event type not registered: ${eventType}`);
    }

    const subscription = createEventSubscription({
      subscriptionId: this.idGenerator.generate(),
      eventType,
      subscriberId,
    });

    return this.eventSubscriber.subscribe(subscription);
  }

  async unsubscribeEvent(input: UnsubscribeEventInput): Promise<{ subscriptionId: string; unsubscribed: boolean }> {
    const subscriptionId = input.subscriptionId.trim();
    const existing = await this.eventSubscriber.findById(subscriptionId);
    if (!existing) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    await this.eventSubscriber.unsubscribe(subscriptionId);
    return Object.freeze({ subscriptionId, unsubscribed: true });
  }

  async getEvent(eventId: string): Promise<EventDefinition | null> {
    return this.eventRepository.findById(eventId.trim());
  }

  async listEvents(): Promise<ListEventsResult> {
    const events = Object.freeze(
      [...(await this.eventRepository.findAll())].sort((left, right) =>
        left.eventType.localeCompare(right.eventType),
      ),
    );

    return Object.freeze({
      events,
      total: events.length,
    });
  }

  async getEventHistory(): Promise<EventHistoryResult> {
    const entries = Object.freeze(
      [...(await this.eventHistoryRepository.findAll())].sort((left, right) =>
        right.publishedAt.localeCompare(left.publishedAt),
      ),
    );

    return Object.freeze({
      entries,
      total: entries.length,
    });
  }

  async clearEventHistory(): Promise<ClearEventHistoryResult> {
    const removedCount = await this.eventHistoryRepository.clear();
    return Object.freeze({ removedCount });
  }
}
