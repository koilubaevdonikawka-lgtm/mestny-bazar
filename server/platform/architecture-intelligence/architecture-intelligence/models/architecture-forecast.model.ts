export type ForecastKind =
  | "growth"
  | "dependency"
  | "complexity"
  | "capability";

/** Architecture forecast metadata. */
export interface ArchitectureForecast {
  readonly id: string;
  readonly kind: ForecastKind;
  readonly generatedAt: string;
  readonly projections: readonly string[];
  readonly confidence: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createArchitectureForecast(input: {
  id?: string;
  kind: ForecastKind;
  projections?: readonly string[];
  confidence?: number;
  metadata?: Readonly<Record<string, unknown>>;
}): ArchitectureForecast {
  return Object.freeze({
    id: input.id ?? `forecast-${Date.now()}`,
    kind: input.kind,
    generatedAt: new Date().toISOString(),
    projections: Object.freeze([...(input.projections ?? [])]),
    confidence: input.confidence ?? 0.75,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
