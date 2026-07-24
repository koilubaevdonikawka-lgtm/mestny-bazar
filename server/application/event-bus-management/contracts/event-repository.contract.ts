import type { EventDefinition } from "@server/application/event-bus-management/models/event.model";

export interface IEventRepository {
  save(definition: EventDefinition): Promise<void>;
  findById(eventId: string): Promise<EventDefinition | null>;
  findByType(eventType: string): Promise<EventDefinition | null>;
  findAll(): Promise<readonly EventDefinition[]>;
}
