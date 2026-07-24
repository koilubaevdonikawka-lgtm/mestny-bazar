export type RolloutStrategy = "immediate" | "percentage" | "staged" | "scheduled";

/** Rollout plan metadata (no automatic execution). */
export interface RolloutPlan {
  readonly id: string;
  readonly featureId: string;
  readonly strategy: RolloutStrategy;
  readonly percentage?: number;
  readonly stages?: readonly string[];
  readonly scheduledAt?: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createRolloutPlan(input: {
  id?: string;
  featureId: string;
  strategy: RolloutStrategy;
  percentage?: number;
  stages?: readonly string[];
  scheduledAt?: string;
  metadata?: Readonly<Record<string, unknown>>;
}): RolloutPlan {
  return Object.freeze({
    id: input.id ?? `rollout-${Date.now()}`,
    featureId: input.featureId.trim(),
    strategy: input.strategy,
    percentage: input.percentage,
    stages: input.stages ? Object.freeze([...input.stages]) : undefined,
    scheduledAt: input.scheduledAt,
    createdAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
