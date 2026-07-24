import type { ISecurityProfileStatisticsProvider } from "@server/application/ai-security-profile-registry/contracts/security-profile-statistics-provider.contract";
import type { SecurityProfileRegistryStatistics } from "@server/application/ai-security-profile-registry/models/security-profile.model";

/** Default in-memory security profile statistics provider. */
export class DefaultSecurityProfileStatisticsProvider implements ISecurityProfileStatisticsProvider {
  async getStatistics(input: {
    totalSecurityProfiles: number;
    activeSecurityProfiles: number;
    categories: readonly string[];
  }): Promise<SecurityProfileRegistryStatistics> {
    return Object.freeze({
      totalSecurityProfiles: input.totalSecurityProfiles,
      activeSecurityProfiles: input.activeSecurityProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
