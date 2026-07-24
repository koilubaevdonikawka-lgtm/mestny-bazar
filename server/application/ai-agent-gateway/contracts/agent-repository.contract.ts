import type { AiAgent } from "@server/application/ai-agent-gateway/models/agent.model";

export interface IAgentRepository {
  save(agent: AiAgent): Promise<void>;
  findById(agentId: string): Promise<AiAgent | null>;
  findAll(): Promise<readonly AiAgent[]>;
}
