import type { IComplianceManager } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceRegistry } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceValidator } from "@server/platform/compliance/compliance/contracts";
import type { ICertificationEngine } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceScoringEngine } from "@server/platform/compliance/compliance/contracts";
import type { IComplianceReportGenerator } from "@server/platform/compliance/compliance/contracts";
import type {
  ComplianceAssessment,
  ComplianceCertificate,
  ComplianceReport,
  ComplianceStandard,
} from "@server/platform/compliance/compliance/models";

/** Orchestrates compliance registration, assessment, certification and reporting. */
export class ComplianceManager implements IComplianceManager {
  constructor(
    private readonly registry: IComplianceRegistry,
    private readonly validator: IComplianceValidator,
    private readonly certificationEngine: ICertificationEngine,
    private readonly scoringEngine: IComplianceScoringEngine,
    private readonly reportGenerator: IComplianceReportGenerator,
  ) {}

  registerStandard(standard: ComplianceStandard): ComplianceStandard {
    return this.registry.register(standard);
  }

  runAssessment(standardId: string): ComplianceAssessment {
    const standard = this.requireStandard(standardId);
    return this.validator.validate(standard);
  }

  generateReport(kind: ComplianceReport["kind"] = "assessment"): ComplianceReport {
    const standards = this.registry.list();
    const assessments = this.validator.validateAll(standards);
    const score = this.scoringEngine.calculate(standards, assessments);
    return this.reportGenerator.generate(kind, assessments, score);
  }

  issueCertificate(standardId: string): ComplianceCertificate {
    const assessment = this.runAssessment(standardId);
    return this.certificationEngine.certify(assessment);
  }

  listStandards(category?: ComplianceStandard["category"]): readonly ComplianceStandard[] {
    return this.registry.list(category);
  }

  private requireStandard(standardId: string): ComplianceStandard {
    const standard = this.registry.get(standardId);
    if (!standard) {
      throw new Error(`Compliance standard not found: ${standardId}`);
    }
    return standard;
  }
}
