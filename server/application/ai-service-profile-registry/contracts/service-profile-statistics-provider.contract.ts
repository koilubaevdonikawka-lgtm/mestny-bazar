import type { ServiceProfileRegistryStatistics } from "@server/application/ai-service-profile-registry/models/service-profile.model";

export interface IServiceProfileStatisticsProvider {
  getStatistics(input: {
    totalServiceProfiles: number;
    activeServiceProfiles: number;
    categories: readonly string[];
  }): Promise<ServiceProfileRegistryStatistics>;
}
