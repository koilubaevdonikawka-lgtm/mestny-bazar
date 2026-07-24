import type { CommandRegistryStatistics } from "@server/application/ai-command-registry/models/command.model";

export interface ICommandStatisticsProvider {
  getStatistics(input: {
    totalCommands: number;
    activeCommands: number;
    categories: readonly string[];
  }): Promise<CommandRegistryStatistics>;
}
