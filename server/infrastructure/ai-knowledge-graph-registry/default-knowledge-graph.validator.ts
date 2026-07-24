import type {
  IKnowledgeGraphValidator,
  KnowledgeGraphValidationResult,
} from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-validator.contract";
import type {
  RegisterKnowledgeGraphInput,
  KnowledgeGraph,
  UpdateKnowledgeGraphInput,
} from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

/** Default knowledge graph validator. */
export class DefaultKnowledgeGraphValidator implements IKnowledgeGraphValidator {
  async validateRegistration(
    input: RegisterKnowledgeGraphInput,
  ): Promise<KnowledgeGraphValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Knowledge graph name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Knowledge graph category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Knowledge graph status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: KnowledgeGraph,
    input: UpdateKnowledgeGraphInput,
  ): Promise<KnowledgeGraphValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Knowledge graph name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Knowledge graph category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Knowledge graph status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Knowledge graph is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
