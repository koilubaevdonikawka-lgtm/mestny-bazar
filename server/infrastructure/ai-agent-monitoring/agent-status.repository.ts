import type { IAgentStatusRepository } from "@server/application/ai-agent-monitoring/contracts/agent-status-repository.contract";
import type { AgentStatus } from "@server/application/ai-agent-monitoring/models/monitoring.model";

/** In-memory agent status store. */
export class AgentStatusRepository implements IAgentStatusRepository {
  private readonly statuses = new Map<string, AgentStatus>();

  async save(status: AgentStatus): Promise<void> {
    this.statuses.set(status.statusId, status);
  }

  async findById(statusId: string): Promise<AgentStatus | null> {
    return this.statuses.get(statusId.trim()) ?? null;
  }

  async findLatestByAgentId(agentId: string): Promise<AgentStatus | null> {
    const normalizedAgentId = agentId.trim();
    const agentStatuses = [...this.statuses.values()].filter(
      (status) => status.agentId === normalizedAgentId,
    );
    if (agentStatuses.length === 0) {
      return null;
    }
    return agentStatuses.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] ?? null;
  }

  async findAll(): Promise<readonly AgentStatus[]> {
    return Object.freeze([...this.statuses.values()]);
  }
}
