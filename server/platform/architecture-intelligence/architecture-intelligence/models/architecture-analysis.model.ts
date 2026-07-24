export type AnalysisDimension =
  | "dependencies"
  | "layering"
  | "coupling"
  | "modularity"
  | "platform-boundaries"
  | "capability-relations";

/** Architecture analysis result metadata. */
export interface ArchitectureAnalysis {
  readonly id: string;
  readonly analyzedAt: string;
  readonly dimensions: readonly AnalysisDimension[];
  readonly findings: readonly string[];
  readonly metrics: Readonly<Record<string, number>>;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createArchitectureAnalysis(input: {
  id?: string;
  dimensions: readonly AnalysisDimension[];
  findings?: readonly string[];
  metrics?: Readonly<Record<string, number>>;
  metadata?: Readonly<Record<string, unknown>>;
}): ArchitectureAnalysis {
  return Object.freeze({
    id: input.id ?? `analysis-${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    dimensions: Object.freeze([...input.dimensions]),
    findings: Object.freeze([...(input.findings ?? [])]),
    metrics: Object.freeze({ ...(input.metrics ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
