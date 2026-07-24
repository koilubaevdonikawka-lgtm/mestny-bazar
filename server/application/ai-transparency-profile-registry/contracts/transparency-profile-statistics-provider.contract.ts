import type { TransparencyProfileRegistryStatistics } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

export interface ITransparencyProfileStatisticsProvider {
  getStatistics(input: {
    totalTransparencyProfiles: number;
    activeTransparencyProfiles: number;
    categories: readonly string[];
  }): Promise<TransparencyProfileRegistryStatistics>;
}
