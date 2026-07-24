/**
 * Future integration ports for Event Bus Management.
 * Not implemented — reserved for external message brokers.
 */

import type {
  EventDefinition,
  PublishedEvent,
} from "@server/application/event-bus-management/models/event.model";

/** Kafka Event Bus Provider — Apache Kafka integration. */
export interface IKafkaEventBusProvider {
  publish(event: PublishedEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: PublishedEvent) => Promise<void>): Promise<void>;
}

/** RabbitMQ Provider — RabbitMQ integration. */
export interface IRabbitMqProvider {
  publishToExchange(exchange: string, event: PublishedEvent): Promise<void>;
  consumeQueue(queue: string, handler: (event: PublishedEvent) => Promise<void>): Promise<void>;
}

/** Azure Service Bus Provider — Azure integration. */
export interface IAzureServiceBusProvider {
  sendMessage(topic: string, event: PublishedEvent): Promise<void>;
  receiveMessages(subscription: string): Promise<readonly PublishedEvent[]>;
}

/** Google Pub/Sub Provider — GCP integration. */
export interface IGooglePubSubProvider {
  publishMessage(topic: string, event: PublishedEvent): Promise<void>;
  pullMessages(subscription: string): Promise<readonly PublishedEvent[]>;
}

/** NATS Provider — NATS messaging integration. */
export interface INatsProvider {
  publish(subject: string, event: PublishedEvent): Promise<void>;
  subscribe(subject: string, handler: (event: PublishedEvent) => Promise<void>): Promise<void>;
}

export type { EventDefinition, PublishedEvent };
