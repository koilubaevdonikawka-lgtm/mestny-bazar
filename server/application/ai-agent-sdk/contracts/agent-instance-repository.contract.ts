import type { AgentInstance } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

export interface IAgentInstanceRepository {
  save(instance: AgentInstance): Promise<void>;
  findById(instanceId: string): Promise<AgentInstance | null>;
  findBySdkId(sdkId: string): Promise<readonly AgentInstance[]>;
  findAll(): Promise<readonly AgentInstance[]>;
  delete(instanceId: string): Promise<boolean>;
  deleteBySdkId(sdkId: string): Promise<number>;
}
