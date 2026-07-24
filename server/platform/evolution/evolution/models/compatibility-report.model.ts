export interface CompatibilityFinding {
  readonly area: string;
  readonly compatible: boolean;
  readonly message: string;
}

/** Compatibility assessment report for evolution planning. */
export interface CompatibilityReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly compatible: boolean;
  readonly findings: readonly CompatibilityFinding[];
}

export function createCompatibilityReport(input: {
  id?: string;
  findings: readonly CompatibilityFinding[];
}): CompatibilityReport {
  const compatible = input.findings.every((finding) => finding.compatible);
  return Object.freeze({
    id: input.id ?? `compat-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    compatible,
    findings: Object.freeze([...input.findings]),
  });
}
