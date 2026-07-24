import type { SemanticRequestHistoryEntry } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

export interface ISemanticRequestHistoryRepository {
  save(entry: SemanticRequestHistoryEntry): Promise<void>;
  findAll(): Promise<readonly SemanticRequestHistoryEntry[]>;
}
