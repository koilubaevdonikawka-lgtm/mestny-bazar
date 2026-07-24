import type { IEthicsProfileStatisticsProvider } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-statistics-provider.contract";
import type { EthicsProfileRegistryStatistics } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

/** Default in-memory ethics profile statistics provider. */
export class DefaultEthicsProfileStatisticsProvider implements IEthicsProfileStatisticsProvider {
  async getStatistics(input: {
    totalEthicsProfiles: number;
    activeEthicsProfiles: number;
    categories: readonly string[];
  }): Promise<EthicsProfileRegistryStatistics> {
    return Object.freeze({
      totalEthicsProfiles: input.totalEthicsProfiles,
      activeEthicsProfiles: input.activeEthicsProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
