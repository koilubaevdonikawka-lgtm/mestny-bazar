/** Registered event type definition — no domain data. */
export interface EventDefinition {
  readonly eventId: string;
  readonly eventType: string;
  readonly description: string;
  readonly source: string;
  readonly createdAt: string;
}

/** Published event instance. */
export interface PublishedEvent {
  readonly publicationId: string;
  readonly eventId: string;
  readonly eventType: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly source: string;
  readonly publishedAt: string;
  readonly deliveredCount: number;
}

/** Event subscription record. */
export interface EventSubscription {
  readonly subscriptionId: string;
  readonly eventType: string;
  readonly subscriberId: string;
  readonly createdAt: string;
}

/** Event publication history entry. */
export interface EventHistoryEntry {
  readonly historyId: string;
  readonly publicationId: string;
  readonly eventId: string;
  readonly eventType: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly source: string;
  readonly publishedAt: string;
  readonly deliveredCount: number;
}

export interface RegisterEventInput {
  readonly eventType: string;
  readonly description?: string;
  readonly source?: string;
}

export interface PublishEventInput {
  readonly eventType: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly source?: string;
}

export interface SubscribeEventInput {
  readonly eventType: string;
  readonly subscriberId: string;
}

export interface UnsubscribeEventInput {
  readonly subscriptionId: string;
}

export interface ListEventsResult {
  readonly events: readonly EventDefinition[];
  readonly total: number;
}

export interface EventHistoryResult {
  readonly entries: readonly EventHistoryEntry[];
  readonly total: number;
}

export interface ClearEventHistoryResult {
  readonly removedCount: number;
}

export function createEventDefinition(input: {
  eventId: string;
  eventType: string;
  description?: string;
  source?: string;
  createdAt?: string;
}): EventDefinition {
  return Object.freeze({
    eventId: input.eventId.trim(),
    eventType: input.eventType.trim(),
    description: (input.description ?? "").trim(),
    source: (input.source ?? "system").trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createPublishedEvent(input: {
  publicationId: string;
  eventId: string;
  eventType: string;
  payload?: Readonly<Record<string, string>>;
  source?: string;
  publishedAt?: string;
  deliveredCount: number;
}): PublishedEvent {
  return Object.freeze({
    publicationId: input.publicationId.trim(),
    eventId: input.eventId.trim(),
    eventType: input.eventType.trim(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    source: (input.source ?? "system").trim(),
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    deliveredCount: input.deliveredCount,
  });
}

export function createEventSubscription(input: {
  subscriptionId: string;
  eventType: string;
  subscriberId: string;
  createdAt?: string;
}): EventSubscription {
  return Object.freeze({
    subscriptionId: input.subscriptionId.trim(),
    eventType: input.eventType.trim(),
    subscriberId: input.subscriberId.trim(),
    createdAt: input.createdAt ?? new Date().toISOString(),
  });
}

export function createEventHistoryEntry(input: {
  historyId: string;
  publicationId: string;
  eventId: string;
  eventType: string;
  payload?: Readonly<Record<string, string>>;
  source?: string;
  publishedAt?: string;
  deliveredCount: number;
}): EventHistoryEntry {
  return Object.freeze({
    historyId: input.historyId.trim(),
    publicationId: input.publicationId.trim(),
    eventId: input.eventId.trim(),
    eventType: input.eventType.trim(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    source: (input.source ?? "system").trim(),
    publishedAt: input.publishedAt ?? new Date().toISOString(),
    deliveredCount: input.deliveredCount,
  });
}
