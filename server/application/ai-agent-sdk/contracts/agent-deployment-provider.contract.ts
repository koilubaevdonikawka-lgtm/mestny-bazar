import type { AgentInstance } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Future integration point for agent deployment. Not wired yet. */
export interface IAgentDeploymentProvider {
  deploy(instance: AgentInstance): Promise<{ deploymentId: string }>;
  undeploy(deploymentId: string): Promise<void>;
}
