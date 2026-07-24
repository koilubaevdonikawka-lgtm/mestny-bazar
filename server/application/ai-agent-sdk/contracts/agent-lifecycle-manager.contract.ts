import type { AgentInstance } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

export interface AgentLifecycleResult {
  readonly instance: AgentInstance;
  readonly mock: boolean;
}

export interface IAgentLifecycleManager {
  initialize(instance: AgentInstance): Promise<AgentLifecycleResult>;
  start(instance: AgentInstance): Promise<AgentLifecycleResult>;
  stop(instance: AgentInstance): Promise<AgentLifecycleResult>;
}
