/** Architecture score breakdown metadata. */
export interface ArchitectureScore {
  readonly id: string;
  readonly calculatedAt: string;
  readonly architectureScore: number;
  readonly maintainabilityScore: number;
  readonly modularityScore: number;
  readonly scalabilityScore: number;
  readonly evolutionReadinessScore: number;
  readonly overallScore: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createArchitectureScore(input: {
  id?: string;
  architectureScore: number;
  maintainabilityScore: number;
  modularityScore: number;
  scalabilityScore: number;
  evolutionReadinessScore: number;
  metadata?: Readonly<Record<string, unknown>>;
}): ArchitectureScore {
  const scores = [
    input.architectureScore,
    input.maintainabilityScore,
    input.modularityScore,
    input.scalabilityScore,
    input.evolutionReadinessScore,
  ];
  const overallScore = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  return Object.freeze({
    id: input.id ?? `score-${Date.now()}`,
    calculatedAt: new Date().toISOString(),
    architectureScore: input.architectureScore,
    maintainabilityScore: input.maintainabilityScore,
    modularityScore: input.modularityScore,
    scalabilityScore: input.scalabilityScore,
    evolutionReadinessScore: input.evolutionReadinessScore,
    overallScore,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
