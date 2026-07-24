import type { INetworkProfileStatisticsProvider } from "@server/application/ai-network-profile-registry/contracts/network-profile-statistics-provider.contract";
import type { NetworkProfileRegistryStatistics } from "@server/application/ai-network-profile-registry/models/network-profile.model";

/** Default in-memory network profile statistics provider. */
export class DefaultNetworkProfileStatisticsProvider implements INetworkProfileStatisticsProvider {
  async getStatistics(input: {
    totalNetworkProfiles: number;
    activeNetworkProfiles: number;
    categories: readonly string[];
  }): Promise<NetworkProfileRegistryStatistics> {
    return Object.freeze({
      totalNetworkProfiles: input.totalNetworkProfiles,
      activeNetworkProfiles: input.activeNetworkProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
