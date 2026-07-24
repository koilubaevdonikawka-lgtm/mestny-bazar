import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

export interface IConstraintRepository {
  save(constraint: Constraint): Promise<void>;
  findById(constraintId: string): Promise<Constraint | null>;
  findByName(name: string): Promise<Constraint | null>;
  findByCategory(category: string): Promise<readonly Constraint[]>;
  findAll(): Promise<readonly Constraint[]>;
  delete(constraintId: string): Promise<boolean>;
}
