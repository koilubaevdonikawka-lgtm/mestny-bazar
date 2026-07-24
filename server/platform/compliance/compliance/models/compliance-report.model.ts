import type { ComplianceAssessment } from "./compliance-assessment.model";

export type ComplianceReportKind =
  | "assessment"
  | "certification"
  | "readiness"
  | "gap-analysis";

/** Generated compliance report metadata. */
export interface ComplianceReport {
  readonly id: string;
  readonly kind: ComplianceReportKind;
  readonly generatedAt: string;
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly assessments: readonly ComplianceAssessment[];
  readonly summary: string;
}

export function createComplianceReport(input: {
  id?: string;
  kind: ComplianceReportKind;
  assessments: readonly ComplianceAssessment[];
  summary?: string;
}): ComplianceReport {
  const passed = input.assessments.filter((assessment) => assessment.passed).length;
  return Object.freeze({
    id: input.id ?? `compliance-report-${Date.now()}`,
    kind: input.kind,
    generatedAt: new Date().toISOString(),
    total: input.assessments.length,
    passed,
    failed: input.assessments.length - passed,
    assessments: Object.freeze([...input.assessments]),
    summary: input.summary?.trim() ?? "",
  });
}

export type ChecklistKind =
  | "architecture"
  | "release"
  | "platform"
  | "operations"
  | "sdk";

export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
}

export interface ChecklistDescriptor {
  readonly id: string;
  readonly name: string;
  readonly kind: ChecklistKind;
  readonly items: readonly ChecklistItem[];
  readonly registeredAt: string;
}

export function createChecklistDescriptor(input: {
  id?: string;
  name: string;
  kind: ChecklistKind;
  items: readonly ChecklistItem[];
}): ChecklistDescriptor {
  return Object.freeze({
    id: input.id ?? `checklist-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    items: Object.freeze([...input.items]),
    registeredAt: new Date().toISOString(),
  });
}

export function createChecklistItem(input: {
  id?: string;
  label: string;
  required?: boolean;
}): ChecklistItem {
  return Object.freeze({
    id: input.id ?? `item-${Date.now()}`,
    label: input.label.trim(),
    required: input.required ?? true,
  });
}
