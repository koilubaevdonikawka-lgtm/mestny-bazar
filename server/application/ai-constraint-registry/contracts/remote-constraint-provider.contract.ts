import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

/** Future integration point for external constraint providers. Not wired yet. */
export interface IRemoteConstraintProvider {
  fetchRemote(constraintId: string): Promise<Constraint | null>;
  pushRemote(constraint: Constraint): Promise<void>;
}
