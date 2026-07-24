import type { IInfrastructureProfileStatisticsProvider } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-statistics-provider.contract";
import type { InfrastructureProfileRegistryStatistics } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** Default in-memory infrastructure profile statistics provider. */
export class DefaultInfrastructureProfileStatisticsProvider implements IInfrastructureProfileStatisticsProvider {
  async getStatistics(input: {
    totalInfrastructureProfiles: number;
    activeInfrastructureProfiles: number;
    categories: readonly string[];
  }): Promise<InfrastructureProfileRegistryStatistics> {
    return Object.freeze({
      totalInfrastructureProfiles: input.totalInfrastructureProfiles,
      activeInfrastructureProfiles: input.activeInfrastructureProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
