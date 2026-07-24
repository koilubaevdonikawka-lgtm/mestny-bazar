import type { IProfileStatisticsProvider } from "@server/application/ai-profile-registry/contracts/profile-statistics-provider.contract";
import type { ProfileRegistryStatistics } from "@server/application/ai-profile-registry/models/profile.model";

/** Default in-memory profile statistics provider. */
export class DefaultProfileStatisticsProvider implements IProfileStatisticsProvider {
  async getStatistics(input: {
    totalProfiles: number;
    activeProfiles: number;
    types: readonly string[];
  }): Promise<ProfileRegistryStatistics> {
    return Object.freeze({
      totalProfiles: input.totalProfiles,
      activeProfiles: input.activeProfiles,
      typeCount: input.types.length,
      types: Object.freeze([...input.types]),
    });
  }
}
