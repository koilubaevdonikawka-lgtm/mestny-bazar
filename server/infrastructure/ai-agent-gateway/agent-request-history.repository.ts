import type { IAgentRequestHistoryRepository } from "@server/application/ai-agent-gateway/contracts/agent-request-history-repository.contract";
import type { AgentRequestHistoryEntry } from "@server/application/ai-agent-gateway/models/agent.model";

/** In-memory agent request history store. */
export class AgentRequestHistoryRepository implements IAgentRequestHistoryRepository {
  private readonly entries: AgentRequestHistoryEntry[] = [];

  async save(entry: AgentRequestHistoryEntry): Promise<void> {
    this.entries.push(entry);
  }

  async findAll(): Promise<readonly AgentRequestHistoryEntry[]> {
    return Object.freeze([...this.entries]);
  }

  async clear(): Promise<number> {
    const removedCount = this.entries.length;
    this.entries.length = 0;
    return removedCount;
  }
}
