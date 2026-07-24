import type { ITransparencyProfileStatisticsProvider } from "@server/application/ai-transparency-profile-registry/contracts/transparency-profile-statistics-provider.contract";
import type { TransparencyProfileRegistryStatistics } from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";

/** Default in-memory transparency profile statistics provider. */
export class DefaultTransparencyProfileStatisticsProvider implements ITransparencyProfileStatisticsProvider {
  async getStatistics(input: {
    totalTransparencyProfiles: number;
    activeTransparencyProfiles: number;
    categories: readonly string[];
  }): Promise<TransparencyProfileRegistryStatistics> {
    return Object.freeze({
      totalTransparencyProfiles: input.totalTransparencyProfiles,
      activeTransparencyProfiles: input.activeTransparencyProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
