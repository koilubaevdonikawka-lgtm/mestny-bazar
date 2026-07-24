import type { ComplianceProfileRegistryStatistics } from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

export interface IComplianceProfileStatisticsProvider {
  getStatistics(input: {
    totalComplianceProfiles: number;
    activeComplianceProfiles: number;
    categories: readonly string[];
  }): Promise<ComplianceProfileRegistryStatistics>;
}
