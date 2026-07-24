import type { IAuditProfileStatisticsProvider } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-statistics-provider.contract";
import type { AuditProfileRegistryStatistics } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** Default in-memory audit profile statistics provider. */
export class DefaultAuditProfileStatisticsProvider implements IAuditProfileStatisticsProvider {
  async getStatistics(input: {
    totalAuditProfiles: number;
    activeAuditProfiles: number;
    categories: readonly string[];
  }): Promise<AuditProfileRegistryStatistics> {
    return Object.freeze({
      totalAuditProfiles: input.totalAuditProfiles,
      activeAuditProfiles: input.activeAuditProfiles,
      categoryCount: input.categories.length,
      categories: Object.freeze([...input.categories]),
    });
  }
}
