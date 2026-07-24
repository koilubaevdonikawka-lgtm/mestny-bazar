import type { ICommandStatisticsProvider } from "@server/application/ai-command-registry/contracts/command-statistics-provider.contract";
import type { CommandRegistryStatistics } from "@server/application/ai-command-registry/models/command.model";

/** Default in-memory command statistics provider. */
export class DefaultCommandStatisticsProvider implements ICommandStatisticsProvider {
  async getStatistics(input: {
    totalCommands: number;
    activeCommands: number;
    categories: readonly string[];
  }): Promise<CommandRegistryStatistics> {
    return Object.freeze({
      totalCommands: input.totalCommands,
      activeCommands: input.activeCommands,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
