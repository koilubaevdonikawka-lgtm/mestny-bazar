import type { IAgentRepository } from "@server/application/ai-agent-gateway/contracts/agent-repository.contract";
import type { AiAgent } from "@server/application/ai-agent-gateway/models/agent.model";

/** In-memory AI agent store. */
export class AgentRepository implements IAgentRepository {
  private readonly agents = new Map<string, AiAgent>();

  async save(agent: AiAgent): Promise<void> {
    this.agents.set(agent.agentId, agent);
  }

  async findById(agentId: string): Promise<AiAgent | null> {
    return this.agents.get(agentId.trim()) ?? null;
  }

  async findAll(): Promise<readonly AiAgent[]> {
    return Object.freeze([...this.agents.values()]);
  }
}
