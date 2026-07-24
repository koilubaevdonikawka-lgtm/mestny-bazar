import type { IComplianceProfileStatisticsProvider } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-statistics-provider.contract";
import type { ComplianceProfileRegistryStatistics } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** Default in-memory compliance profile statistics provider. */
export class DefaultComplianceProfileStatisticsProvider implements IComplianceProfileStatisticsProvider {
  async getStatistics(input: {
    totalComplianceProfiles: number;
    activeComplianceProfiles: number;
    categories: readonly string[];
  }): Promise<ComplianceProfileRegistryStatistics> {
    return Object.freeze({
      totalComplianceProfiles: input.totalComplianceProfiles,
      activeComplianceProfiles: input.activeComplianceProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
