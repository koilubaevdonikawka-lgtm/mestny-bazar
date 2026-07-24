import type { IGovernanceHealthEngine } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import {
  createPlatformHealthReport,
  type PlatformHealthReport,
} from "@server/platform/autonomous-governance/autonomous-governance/models";
import { createGovernanceHealthCalculatedEvent } from "@server/platform/autonomous-governance/autonomous-governance/events";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { LifecyclePlatform } from "@server/platform/lifecycle/lifecycle/lifecycle-platform";

/** Calculates overall platform health scores. */
export class GovernanceHealthEngine implements IGovernanceHealthEngine {
  constructor(
    private readonly architectureIntelligence: ArchitectureIntelligencePlatform,
    private readonly compliancePlatform: CompliancePlatform,
    private readonly policyPlatform: PolicyPlatform,
    private readonly lifecyclePlatform: LifecyclePlatform,
  ) {}

  calculate(): PlatformHealthReport {
    const score = this.architectureIntelligence.calculateArchitectureScore();
    const readiness = this.compliancePlatform.readinessScore();
    const policyReport = this.policyPlatform.generatePolicyReport();
    const lifecycleStatus = this.lifecyclePlatform.status();

    const lifecycleHealth =
      "total" in lifecycleStatus
        ? Math.round((lifecycleStatus.running / Math.max(lifecycleStatus.total, 1)) * 100)
        : lifecycleStatus.state === "running"
          ? 100
          : 50;

    const governanceHealth = Math.round(
      (readiness + (policyReport.failed === 0 ? 100 : 70)) / 2,
    );
    const platformStability = Math.round((score.overallScore + lifecycleHealth) / 2);
    const overallHealth = Math.round(
      (score.overallScore + governanceHealth + platformStability + score.evolutionReadinessScore) / 4,
    );

    const report = createPlatformHealthReport({
      overallHealth,
      architectureHealth: score.architectureScore,
      governanceHealth,
      evolutionReadiness: score.evolutionReadinessScore,
      platformStability,
      findings: Object.freeze([
        `Architecture score: ${score.overallScore}`,
        `Compliance readiness: ${readiness}`,
        `Policy failures: ${policyReport.failed}`,
        `Lifecycle health: ${lifecycleHealth}`,
      ]),
    });

    createGovernanceHealthCalculatedEvent(report);
    return report;
  }
}
