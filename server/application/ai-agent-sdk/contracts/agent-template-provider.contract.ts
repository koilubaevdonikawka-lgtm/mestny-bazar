import type { AgentSdk } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Future integration point for agent templates. Not wired yet. */
export interface IAgentTemplateProvider {
  listTemplates(): Promise<readonly string[]>;
  applyTemplate(templateId: string): Promise<Partial<AgentSdk>>;
}
