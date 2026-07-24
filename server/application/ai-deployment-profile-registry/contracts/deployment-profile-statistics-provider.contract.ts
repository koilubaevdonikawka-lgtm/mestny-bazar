import type { DeploymentProfileRegistryStatistics } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

export interface IDeploymentProfileStatisticsProvider {
  getStatistics(input: {
    totalDeploymentProfiles: number;
    activeDeploymentProfiles: number;
    categories: readonly string[];
  }): Promise<DeploymentProfileRegistryStatistics>;
}
