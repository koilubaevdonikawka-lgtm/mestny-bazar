import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

/** Future integration point for constraint synchronization. Not wired yet. */
export interface IConstraintSynchronizationProvider {
  synchronize(constraints: readonly Constraint[]): Promise<void>;
}
