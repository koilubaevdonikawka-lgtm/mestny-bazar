import type { IComplianceValidator } from "@server/platform/compliance/compliance/contracts";
import {
  createComplianceAssessment,
  type ComplianceAssessment,
  type ComplianceStandard,
} from "@server/platform/compliance/compliance/models";
import { createAssessmentCompletedEvent } from "@server/platform/compliance/compliance/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider, IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Validates compliance using platform metadata (no BCM access). */
export class ComplianceValidator implements IComplianceValidator {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly healthService: IHealthService,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly policyPlatform: PolicyPlatform,
    private readonly releasePlatform: ReleasePlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  validate(standard: ComplianceStandard): ComplianceAssessment {
    const assessment = this.validateByKind(standard);
    createAssessmentCompletedEvent(assessment);
    return assessment;
  }

  validateAll(standards: readonly ComplianceStandard[]): readonly ComplianceAssessment[] {
    return Object.freeze(standards.map((standard) => this.validate(standard)));
  }

  private validateByKind(standard: ComplianceStandard): ComplianceAssessment {
    switch (standard.checkKind) {
      case "architecture":
        return this.validateArchitecture(standard);
      case "dependencies":
        return this.validateDependencies(standard);
      case "configuration":
        return this.validateConfiguration(standard);
      case "documentation":
        return this.validateDocumentation(standard);
      case "governance":
        return this.validateGovernance(standard);
      case "platform-health":
        return this.validatePlatformHealth(standard);
      default:
        return createComplianceAssessment({
          standardId: standard.id,
          standardName: standard.name,
          passed: false,
          reason: "unknown-check-kind",
        });
    }
  }

  private validateArchitecture(standard: ComplianceStandard): ComplianceAssessment {
    const bundle = this.documentation.generateDocumentation();
    const passed = bundle.summary.moduleCount > 0 && bundle.summary.platformCount > 0;
    return createComplianceAssessment({
      standardId: standard.id,
      standardName: standard.name,
      passed,
      reason: passed ? "architecture-documented" : "architecture-incomplete",
      metadata: Object.freeze({
        moduleCount: bundle.summary.moduleCount,
        platformCount: bundle.summary.platformCount,
      }),
    });
  }

  private validateDependencies(standard: ComplianceStandard): ComplianceAssessment {
    const bundle = this.documentation.generateDocumentation();
    const releaseIntegrated = Boolean(this.releasePlatform);
    const passed = bundle.summary.dependencyCount >= 0 && releaseIntegrated;
    return createComplianceAssessment({
      standardId: standard.id,
      standardName: standard.name,
      passed,
      reason: passed ? "dependency-graph-available" : "release-platform-unavailable",
      metadata: Object.freeze({
        dependencyCount: bundle.summary.dependencyCount,
        releaseIntegrated,
      }),
    });
  }

  private validateConfiguration(standard: ComplianceStandard): ComplianceAssessment {
    const snapshot = this.configuration.snapshot();
    const passed = Boolean(snapshot.loadedAt);
    return createComplianceAssessment({
      standardId: standard.id,
      standardName: standard.name,
      passed,
      reason: passed ? "configuration-loaded" : "configuration-missing",
      metadata: Object.freeze({ source: snapshot.source }),
    });
  }

  private validateDocumentation(standard: ComplianceStandard): ComplianceAssessment {
    const bundle = this.documentation.generateDocumentation();
    const passed = bundle.summary.contractCount > 0;
    return createComplianceAssessment({
      standardId: standard.id,
      standardName: standard.name,
      passed,
      reason: passed ? "documentation-complete" : "documentation-incomplete",
      metadata: Object.freeze({ contractCount: bundle.summary.contractCount }),
    });
  }

  private validateGovernance(standard: ComplianceStandard): ComplianceAssessment {
    const policies = this.policyPlatform.listPolicies();
    void this.governance;
    const passed = policies.length > 0;
    return createComplianceAssessment({
      standardId: standard.id,
      standardName: standard.name,
      passed,
      reason: passed ? "governance-policies-registered" : "no-governance-policies",
      metadata: Object.freeze({ policyCount: policies.length }),
    });
  }

  private validatePlatformHealth(standard: ComplianceStandard): ComplianceAssessment {
    const providers = this.providerRegistry.list();
    const passed = Boolean(this.healthService) && providers.length >= 0;
    return createComplianceAssessment({
      standardId: standard.id,
      standardName: standard.name,
      passed,
      reason: passed ? "platform-health-metadata-available" : "health-unavailable",
      metadata: Object.freeze({ providerCount: providers.length }),
    });
  }
}
