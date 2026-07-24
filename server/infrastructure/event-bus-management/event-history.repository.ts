import type { IEventHistoryRepository } from "@server/application/event-bus-management/contracts/event-history-repository.contract";
import type { EventHistoryEntry } from "@server/application/event-bus-management/models/event.model";

/** In-memory event publication history store. */
export class EventHistoryRepository implements IEventHistoryRepository {
  private readonly entries = new Map<string, EventHistoryEntry>();

  async save(entry: EventHistoryEntry): Promise<void> {
    this.entries.set(entry.historyId, entry);
  }

  async findByPublicationId(publicationId: string): Promise<EventHistoryEntry | null> {
    const match = [...this.entries.values()].find(
      (entry) => entry.publicationId === publicationId.trim(),
    );
    return match ?? null;
  }

  async findAll(): Promise<readonly EventHistoryEntry[]> {
    return Object.freeze([...this.entries.values()]);
  }

  async clear(): Promise<number> {
    const count = this.entries.size;
    this.entries.clear();
    return count;
  }
}
