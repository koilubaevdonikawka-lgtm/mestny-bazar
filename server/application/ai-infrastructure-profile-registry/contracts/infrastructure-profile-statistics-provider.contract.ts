import type { InfrastructureProfileRegistryStatistics } from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

export interface IInfrastructureProfileStatisticsProvider {
  getStatistics(input: {
    totalInfrastructureProfiles: number;
    activeInfrastructureProfiles: number;
    categories: readonly string[];
  }): Promise<InfrastructureProfileRegistryStatistics>;
}
