import type {
  ComplianceStandard,
  ComplianceStandardCategory,
} from "@server/platform/compliance/compliance/models";

/** Contract for compliance standard registration. */
export interface IComplianceRegistry {
  register(standard: ComplianceStandard): ComplianceStandard;
  get(standardId: string): ComplianceStandard | undefined;
  list(category?: ComplianceStandardCategory): readonly ComplianceStandard[];
}
