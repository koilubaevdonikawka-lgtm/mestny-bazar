import type { AgentActivityEntry } from "@server/application/ai-agent-monitoring/models/monitoring.model";

export interface IAgentActivityRepository {
  save(entry: AgentActivityEntry): Promise<void>;
  findAll(): Promise<readonly AgentActivityEntry[]>;
  findByAgentId(agentId: string): Promise<readonly AgentActivityEntry[]>;
}
