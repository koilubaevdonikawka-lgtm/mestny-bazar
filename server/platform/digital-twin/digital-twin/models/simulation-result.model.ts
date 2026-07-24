export type SimulationKind =
  | "architecture"
  | "dependency"
  | "capability"
  | "lifecycle";

/** Simulation outcome metadata (no real system changes). */
export interface SimulationResult {
  readonly id: string;
  readonly kind: SimulationKind;
  readonly snapshotId: string;
  readonly executedAt: string;
  readonly success: boolean;
  readonly findings: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createSimulationResult(input: {
  id?: string;
  kind: SimulationKind;
  snapshotId: string;
  success?: boolean;
  findings?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): SimulationResult {
  return Object.freeze({
    id: input.id ?? `simulation-${Date.now()}`,
    kind: input.kind,
    snapshotId: input.snapshotId.trim(),
    executedAt: new Date().toISOString(),
    success: input.success ?? true,
    findings: Object.freeze([...(input.findings ?? [])]),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
