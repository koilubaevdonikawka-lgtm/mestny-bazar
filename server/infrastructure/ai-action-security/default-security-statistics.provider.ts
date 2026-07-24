import type { ISecurityStatisticsProvider } from "@server/application/ai-action-security/contracts/security-statistics-provider.contract";
import type { SecurityStatistics } from "@server/application/ai-action-security/models/security-policy.model";

/** Default in-memory security statistics provider. */
export class DefaultSecurityStatisticsProvider implements ISecurityStatisticsProvider {
  private totalChecks = 0;
  private allowedChecks = 0;
  private deniedChecks = 0;

  async recordCheck(allowed: boolean): Promise<void> {
    this.totalChecks += 1;
    if (allowed) {
      this.allowedChecks += 1;
    } else {
      this.deniedChecks += 1;
    }
  }

  async getStatistics(input: {
    totalPolicies: number;
    activePolicies: number;
  }): Promise<SecurityStatistics> {
    return Object.freeze({
      totalPolicies: input.totalPolicies,
      activePolicies: input.activePolicies,
      totalChecks: this.totalChecks,
      allowedChecks: this.allowedChecks,
      deniedChecks: this.deniedChecks,
    });
  }
}
