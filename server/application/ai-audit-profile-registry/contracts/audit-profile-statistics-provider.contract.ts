import type { AuditProfileRegistryStatistics } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

export interface IAuditProfileStatisticsProvider {
  getStatistics(input: {
    totalAuditProfiles: number;
    activeAuditProfiles: number;
    categories: readonly string[];
  }): Promise<AuditProfileRegistryStatistics>;
}
