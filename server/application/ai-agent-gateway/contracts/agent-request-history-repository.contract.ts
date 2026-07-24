import type { AgentRequestHistoryEntry } from "@server/application/ai-agent-gateway/models/agent.model";

export interface IAgentRequestHistoryRepository {
  save(entry: AgentRequestHistoryEntry): Promise<void>;
  findAll(): Promise<readonly AgentRequestHistoryEntry[]>;
  clear(): Promise<number>;
}
