import type { NetworkProfileRegistryStatistics } from "@server/application/ai-network-profile-registry/models/network-profile.model";

export interface INetworkProfileStatisticsProvider {
  getStatistics(input: {
    totalNetworkProfiles: number;
    activeNetworkProfiles: number;
    categories: readonly string[];
  }): Promise<NetworkProfileRegistryStatistics>;
}
