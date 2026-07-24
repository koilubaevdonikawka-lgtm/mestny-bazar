import type { EventHistoryEntry } from "@server/application/event-bus-management/models/event.model";

export interface IEventHistoryRepository {
  save(entry: EventHistoryEntry): Promise<void>;
  findByPublicationId(publicationId: string): Promise<EventHistoryEntry | null>;
  findAll(): Promise<readonly EventHistoryEntry[]>;
  clear(): Promise<number>;
}
