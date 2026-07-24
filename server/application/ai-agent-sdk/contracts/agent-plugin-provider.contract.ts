import type { AgentSdk } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Future integration point for agent plugins. Not wired yet. */
export interface IAgentPluginProvider {
  loadPlugins(sdk: AgentSdk): Promise<readonly string[]>;
  unloadPlugins(sdkId: string): Promise<void>;
}
