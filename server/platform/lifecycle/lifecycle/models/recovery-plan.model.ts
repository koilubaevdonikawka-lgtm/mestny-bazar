export type RecoveryPlanKind =
  | "restart"
  | "recovery"
  | "safe-shutdown"
  | "rollback";

/** Recovery or shutdown plan metadata (no execution). */
export interface RecoveryPlan {
  readonly id: string;
  readonly componentId: string;
  readonly kind: RecoveryPlanKind;
  readonly steps: readonly string[];
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createRecoveryPlan(input: {
  id?: string;
  componentId: string;
  kind: RecoveryPlanKind;
  steps?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): RecoveryPlan {
  return Object.freeze({
    id: input.id ?? `recovery-${Date.now()}`,
    componentId: input.componentId.trim(),
    kind: input.kind,
    steps: Object.freeze([...(input.steps ?? [])]),
    createdAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
