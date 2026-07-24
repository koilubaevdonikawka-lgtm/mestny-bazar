import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

/** Future integration point for constraint export. Not wired yet. */
export interface IConstraintExportProvider {
  exportTo(constraints: readonly Constraint[]): Promise<string>;
}
