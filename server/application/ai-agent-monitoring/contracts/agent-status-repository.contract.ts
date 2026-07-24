import type { AgentStatus } from "@server/application/ai-agent-monitoring/models/monitoring.model";

export interface IAgentStatusRepository {
  save(status: AgentStatus): Promise<void>;
  findById(statusId: string): Promise<AgentStatus | null>;
  findLatestByAgentId(agentId: string): Promise<AgentStatus | null>;
  findAll(): Promise<readonly AgentStatus[]>;
}
