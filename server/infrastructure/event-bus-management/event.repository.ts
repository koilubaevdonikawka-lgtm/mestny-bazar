import type { IEventRepository } from "@server/application/event-bus-management/contracts/event-repository.contract";
import type { EventDefinition } from "@server/application/event-bus-management/models/event.model";

/** In-memory event type definition store. */
export class EventRepository implements IEventRepository {
  private readonly events = new Map<string, EventDefinition>();
  private readonly eventsByType = new Map<string, string>();

  async save(definition: EventDefinition): Promise<void> {
    this.events.set(definition.eventId, definition);
    this.eventsByType.set(definition.eventType, definition.eventId);
  }

  async findById(eventId: string): Promise<EventDefinition | null> {
    return this.events.get(eventId.trim()) ?? null;
  }

  async findByType(eventType: string): Promise<EventDefinition | null> {
    const eventId = this.eventsByType.get(eventType.trim());
    if (!eventId) {
      return null;
    }
    return this.findById(eventId);
  }

  async findAll(): Promise<readonly EventDefinition[]> {
    return Object.freeze([...this.events.values()]);
  }
}
