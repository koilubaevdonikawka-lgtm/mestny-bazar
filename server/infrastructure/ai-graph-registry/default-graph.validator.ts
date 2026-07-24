import type {
  IGraphValidator,
  GraphValidationResult,
} from "@server/application/ai-graph-registry/contracts/graph-validator.contract";
import type {
  RegisterGraphInput,
  Graph,
  UpdateGraphInput,
} from "@server/application/ai-graph-registry/models/graph.model";

/** Default graph validator. */
export class DefaultGraphValidator implements IGraphValidator {
  async validateRegistration(input: RegisterGraphInput): Promise<GraphValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Graph name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Graph category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Graph status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Graph, input: UpdateGraphInput): Promise<GraphValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Graph name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Graph category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Graph status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Graph is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
