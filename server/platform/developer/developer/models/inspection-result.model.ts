export interface InspectionFinding {
  readonly code: string;
  readonly message: string;
  readonly target?: string;
}

/** Result of a developer inspection run. */
export interface InspectionResult {
  readonly inspectorId: string;
  readonly inspectedAt: string;
  readonly passed: boolean;
  readonly findings: readonly InspectionFinding[];
}

export function createInspectionResult(input: {
  inspectorId: string;
  passed: boolean;
  findings?: readonly InspectionFinding[];
}): InspectionResult {
  return Object.freeze({
    inspectorId: input.inspectorId.trim(),
    inspectedAt: new Date().toISOString(),
    passed: input.passed,
    findings: Object.freeze([...(input.findings ?? [])]),
  });
}
