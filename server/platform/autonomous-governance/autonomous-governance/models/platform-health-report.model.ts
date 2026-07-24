/** Platform health report metadata. */
export interface PlatformHealthReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly overallHealth: number;
  readonly architectureHealth: number;
  readonly governanceHealth: number;
  readonly evolutionReadiness: number;
  readonly platformStability: number;
  readonly findings: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createPlatformHealthReport(input: {
  id?: string;
  overallHealth: number;
  architectureHealth: number;
  governanceHealth: number;
  evolutionReadiness: number;
  platformStability: number;
  findings?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): PlatformHealthReport {
  return Object.freeze({
    id: input.id ?? `health-report-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    overallHealth: input.overallHealth,
    architectureHealth: input.architectureHealth,
    governanceHealth: input.governanceHealth,
    evolutionReadiness: input.evolutionReadiness,
    platformStability: input.platformStability,
    findings: Object.freeze([...(input.findings ?? [])]),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
