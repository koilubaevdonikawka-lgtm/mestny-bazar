import type { SecurityStatistics } from "@server/application/ai-action-security/models/security-policy.model";

export interface ISecurityStatisticsProvider {
  recordCheck(allowed: boolean): Promise<void>;
  getStatistics(input: {
    totalPolicies: number;
    activePolicies: number;
  }): Promise<SecurityStatistics>;
}
