import type { AgentSdk } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

export interface IAgentSdkRepository {
  save(sdk: AgentSdk): Promise<void>;
  findById(sdkId: string): Promise<AgentSdk | null>;
  findByName(name: string): Promise<AgentSdk | null>;
  findAll(): Promise<readonly AgentSdk[]>;
  delete(sdkId: string): Promise<boolean>;
}
