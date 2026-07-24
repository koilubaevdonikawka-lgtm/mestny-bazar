import type { IPolicy, IPolicyEngine } from "@server/platform/governance/governance/contracts";
import type { GovernanceReport, PolicyResult } from "@server/platform/governance/governance/models";

/** Public governance platform facade. */
export class GovernancePlatform {
  constructor(private readonly policyEngine: IPolicyEngine) {}

  registerPolicy(policy: IPolicy): void {
    this.policyEngine.registerPolicy(policy);
  }

  evaluate(policyId: string): Promise<PolicyResult> {
    return this.policyEngine.evaluate(policyId);
  }

  evaluateAll(): Promise<readonly PolicyResult[]> {
    return this.policyEngine.evaluateAll();
  }

  generateReport(): Promise<GovernanceReport> {
    return this.policyEngine.generateReport();
  }

  enablePolicy(policyId: string): void {
    this.policyEngine.enablePolicy(policyId);
  }

  disablePolicy(policyId: string): void {
    this.policyEngine.disablePolicy(policyId);
  }
}
