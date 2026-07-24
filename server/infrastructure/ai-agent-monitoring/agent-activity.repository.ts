import type { IAgentActivityRepository } from "@server/application/ai-agent-monitoring/contracts/agent-activity-repository.contract";
import type { AgentActivityEntry } from "@server/application/ai-agent-monitoring/models/monitoring.model";

/** In-memory agent activity store. */
export class AgentActivityRepository implements IAgentActivityRepository {
  private readonly entries = new Map<string, AgentActivityEntry>();
  private readonly entriesByAgentId = new Map<string, Set<string>>();

  async save(entry: AgentActivityEntry): Promise<void> {
    this.entries.set(entry.activityId, entry);
    const agentSet = this.entriesByAgentId.get(entry.agentId) ?? new Set<string>();
    agentSet.add(entry.activityId);
    this.entriesByAgentId.set(entry.agentId, agentSet);
  }

  async findAll(): Promise<readonly AgentActivityEntry[]> {
    return Object.freeze([...this.entries.values()]);
  }

  async findByAgentId(agentId: string): Promise<readonly AgentActivityEntry[]> {
    const activityIds = this.entriesByAgentId.get(agentId.trim());
    if (!activityIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...activityIds]
        .map((activityId) => this.entries.get(activityId))
        .filter((entry): entry is AgentActivityEntry => entry !== undefined),
    );
  }
}
