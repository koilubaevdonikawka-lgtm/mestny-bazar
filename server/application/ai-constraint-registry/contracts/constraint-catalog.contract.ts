import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

export interface IConstraintCatalog {
  register(constraint: Constraint): Promise<void>;
  remove(constraintId: string): Promise<void>;
  findById(constraintId: string): Promise<Constraint | null>;
  findByName(name: string): Promise<Constraint | null>;
  findByCategory(category: string): Promise<readonly Constraint[]>;
  listAll(): Promise<readonly Constraint[]>;
}
