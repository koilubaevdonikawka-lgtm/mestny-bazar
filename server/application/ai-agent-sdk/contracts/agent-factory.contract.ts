import type {
  AgentInstance,
  AgentSdk,
  CreateAgentInstanceInput,
} from "@server/application/ai-agent-sdk/models/agent-sdk.model";

export interface AgentFactoryResult {
  readonly instance: AgentInstance;
  readonly mock: boolean;
}

export interface IAgentFactory {
  create(sdk: AgentSdk, input: CreateAgentInstanceInput, instanceId: string): Promise<AgentFactoryResult>;
}
