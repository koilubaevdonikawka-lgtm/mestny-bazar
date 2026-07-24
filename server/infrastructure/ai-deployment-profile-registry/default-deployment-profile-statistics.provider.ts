import type { IDeploymentProfileStatisticsProvider } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-statistics-provider.contract";
import type { DeploymentProfileRegistryStatistics } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Default in-memory deployment profile statistics provider. */
export class DefaultDeploymentProfileStatisticsProvider implements IDeploymentProfileStatisticsProvider {
  async getStatistics(input: {
    totalDeploymentProfiles: number;
    activeDeploymentProfiles: number;
    categories: readonly string[];
  }): Promise<DeploymentProfileRegistryStatistics> {
    return Object.freeze({
      totalDeploymentProfiles: input.totalDeploymentProfiles,
      activeDeploymentProfiles: input.activeDeploymentProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
