import type { ISemanticRequestHistoryRepository } from "@server/application/ai-semantic-api/contracts/semantic-request-history-repository.contract";
import type { SemanticRequestHistoryEntry } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

/** In-memory semantic request history store. */
export class SemanticRequestHistoryRepository implements ISemanticRequestHistoryRepository {
  private readonly entries: SemanticRequestHistoryEntry[] = [];

  async save(entry: SemanticRequestHistoryEntry): Promise<void> {
    this.entries.push(entry);
  }

  async findAll(): Promise<readonly SemanticRequestHistoryEntry[]> {
    return Object.freeze([...this.entries]);
  }
}
