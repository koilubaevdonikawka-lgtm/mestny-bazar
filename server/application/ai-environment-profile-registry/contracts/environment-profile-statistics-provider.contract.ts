import type { EnvironmentProfileRegistryStatistics } from "@server/application/ai-environment-profile-registry/models/environment-profile.model";

export interface IEnvironmentProfileStatisticsProvider {
  getStatistics(input: {
    totalEnvironmentProfiles: number;
    activeEnvironmentProfiles: number;
    categories: readonly string[];
  }): Promise<EnvironmentProfileRegistryStatistics>;
}
