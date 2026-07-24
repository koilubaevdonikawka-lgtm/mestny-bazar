import type { SecurityProfileRegistryStatistics } from "@server/application/ai-security-profile-registry/models/security-profile.model";

export interface ISecurityProfileStatisticsProvider {
  getStatistics(input: {
    totalSecurityProfiles: number;
    activeSecurityProfiles: number;
    categories: readonly string[];
  }): Promise<SecurityProfileRegistryStatistics>;
}
