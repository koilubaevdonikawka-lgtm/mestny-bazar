import type { EthicsProfileRegistryStatistics } from "@server/application/ai-ethics-profile-registry/models/ethics-profile.model";

export interface IEthicsProfileStatisticsProvider {
  getStatistics(input: {
    totalEthicsProfiles: number;
    activeEthicsProfiles: number;
    categories: readonly string[];
  }): Promise<EthicsProfileRegistryStatistics>;
}
