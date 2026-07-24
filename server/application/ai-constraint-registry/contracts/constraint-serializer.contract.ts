import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

export interface IConstraintSerializer {
  serialize(constraint: Constraint): Promise<string>;
  deserialize(serialized: string): Promise<Constraint>;
}
