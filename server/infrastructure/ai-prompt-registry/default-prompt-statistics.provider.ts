import type { IPromptStatisticsProvider } from "@server/application/ai-prompt-registry/contracts/prompt-statistics-provider.contract";
import type { PromptRegistryStatistics } from "@server/application/ai-prompt-registry/models/prompt.model";

/** Default in-memory prompt statistics provider. */
export class DefaultPromptStatisticsProvider implements IPromptStatisticsProvider {
  async getStatistics(input: {
    totalPrompts: number;
    activePrompts: number;
    categories: readonly string[];
  }): Promise<PromptRegistryStatistics> {
    return Object.freeze({
      totalPrompts: input.totalPrompts,
      activePrompts: input.activePrompts,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
