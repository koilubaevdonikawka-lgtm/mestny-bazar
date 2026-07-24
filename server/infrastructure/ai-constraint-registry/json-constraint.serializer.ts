import type { IConstraintSerializer } from "@server/application/ai-constraint-registry/contracts/constraint-serializer.contract";
import {
  createConstraint,
  type Constraint,
} from "@server/application/ai-constraint-registry/models/constraint.model";

/** JSON-based constraint serializer. */
export class JsonConstraintSerializer implements IConstraintSerializer {
  async serialize(constraint: Constraint): Promise<string> {
    return JSON.stringify(constraint);
  }

  async deserialize(serialized: string): Promise<Constraint> {
    if (!serialized.trim()) {
      throw new Error("Serialized constraint cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Constraint>;
    return createConstraint({
      constraintId: parsed.constraintId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
