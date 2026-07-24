/** DI tokens for the compliance platform. */
export const ComplianceTokens = {
  CompliancePlatform: Symbol.for("compliance.platform"),
  ComplianceManager: Symbol.for("compliance.manager"),
  ComplianceRegistry: Symbol.for("compliance.registry"),
  ComplianceValidator: Symbol.for("compliance.validator"),
  CertificationEngine: Symbol.for("compliance.certificationEngine"),
  ChecklistRegistry: Symbol.for("compliance.checklistRegistry"),
  ComplianceScoringEngine: Symbol.for("compliance.scoringEngine"),
  ComplianceReportGenerator: Symbol.for("compliance.reportGenerator"),
} as const;

export type ComplianceToken = (typeof ComplianceTokens)[keyof typeof ComplianceTokens];
