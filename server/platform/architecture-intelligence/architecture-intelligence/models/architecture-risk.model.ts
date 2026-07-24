export type ArchitectureRiskKind =
  | "architecture"
  | "dependency"
  | "provider"
  | "version"
  | "complexity";

export type ArchitectureRiskSeverity = "low" | "medium" | "high" | "critical";

/** Detected architecture risk metadata. */
export interface ArchitectureRisk {
  readonly id: string;
  readonly kind: ArchitectureRiskKind;
  readonly severity: ArchitectureRiskSeverity;
  readonly title: string;
  readonly description: string;
  readonly sourceId?: string;
  readonly detectedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createArchitectureRisk(input: {
  id?: string;
  kind: ArchitectureRiskKind;
  severity: ArchitectureRiskSeverity;
  title: string;
  description?: string;
  sourceId?: string;
  metadata?: Readonly<Record<string, unknown>>;
}): ArchitectureRisk {
  return Object.freeze({
    id: input.id ?? `risk-${Date.now()}`,
    kind: input.kind,
    severity: input.severity,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    sourceId: input.sourceId?.trim(),
    detectedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
