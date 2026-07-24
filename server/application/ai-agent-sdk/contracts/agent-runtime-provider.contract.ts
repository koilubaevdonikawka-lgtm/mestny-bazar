import type { AgentInstance } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Future integration point for external agent runtimes. Not wired yet. */
export interface IAgentRuntimeProvider {
  deploy(instance: AgentInstance): Promise<{ runtimeId: string }>;
  shutdown(runtimeId: string): Promise<void>;
}
