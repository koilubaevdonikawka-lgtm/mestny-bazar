import type { IComplianceManager } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceScoringEngine } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceRegistry } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceValidator } from "@server/platform/compliance/compliance/contracts";
import type {
  ComplianceAssessment,
  ComplianceCertificate,
  ComplianceReport,
  ComplianceStandard,
} from "@server/platform/compliance/compliance/models";

/** Public compliance platform facade. */
export class CompliancePlatform {
  constructor(
    private readonly manager: IComplianceManager,
    private readonly scoringEngine: IComplianceScoringEngine,
    private readonly registry: IComplianceRegistry,
    private readonly validator: IComplianceValidator,
  ) {}

  registerStandard(standard: ComplianceStandard): ComplianceStandard {
    return this.manager.registerStandard(standard);
  }

  runAssessment(standardId: string): ComplianceAssessment {
    return this.manager.runAssessment(standardId);
  }

  generateReport(kind?: ComplianceReport["kind"]): ComplianceReport {
    return this.manager.generateReport(kind);
  }

  issueCertificate(standardId: string): ComplianceCertificate {
    return this.manager.issueCertificate(standardId);
  }

  listStandards(category?: ComplianceStandard["category"]): readonly ComplianceStandard[] {
    return this.manager.listStandards(category);
  }

  readinessScore(): number {
    const standards = this.registry.list();
    const assessments = this.validator.validateAll(standards);
    const score = this.scoringEngine.calculate(standards, assessments);
    return this.scoringEngine.readinessScore(score);
  }
}
