import type { PromptRegistryStatistics } from "@server/application/ai-prompt-registry/models/prompt.model";

export interface IPromptStatisticsProvider {
  getStatistics(input: {
    totalPrompts: number;
    activePrompts: number;
    categories: readonly string[];
  }): Promise<PromptRegistryStatistics>;
}
