export type RetentionTarget =
  | "logs"
  | "reports"
  | "diagnostics"
  | "snapshots"
  | "test-results";

/** Retention policy for operational artifacts. */
export interface RetentionPolicy {
  readonly id: string;
  readonly target: RetentionTarget;
  readonly maxAgeDays: number;
  readonly maxItems: number;
  readonly enabled: boolean;
}

export function createRetentionPolicy(input: {
  id: string;
  target: RetentionTarget;
  maxAgeDays: number;
  maxItems: number;
  enabled?: boolean;
}): RetentionPolicy {
  return Object.freeze({
    id: input.id.trim(),
    target: input.target,
    maxAgeDays: input.maxAgeDays,
    maxItems: input.maxItems,
    enabled: input.enabled ?? true,
  });
}
