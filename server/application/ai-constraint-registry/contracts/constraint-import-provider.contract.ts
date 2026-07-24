import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

/** Future integration point for constraint import. Not wired yet. */
export interface IConstraintImportProvider {
  importFrom(source: string): Promise<readonly Constraint[]>;
}
