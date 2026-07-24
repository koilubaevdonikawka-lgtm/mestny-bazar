import type { AgentSdk } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Future integration point for package registries. Not wired yet. */
export interface IAgentPackageProvider {
  resolvePackage(sdk: AgentSdk): Promise<{ packageId: string; version: string }>;
  publishPackage(sdk: AgentSdk): Promise<void>;
}
