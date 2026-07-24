import type {
  IKnowledgePackageValidator,
  KnowledgePackageValidationResult,
} from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-validator.contract";
import type {
  RegisterKnowledgePackageInput,
  KnowledgePackage,
  UpdateKnowledgePackageInput,
} from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Default knowledge package validator. */
export class DefaultKnowledgePackageValidator implements IKnowledgePackageValidator {
  async validateRegistration(
    input: RegisterKnowledgePackageInput,
  ): Promise<KnowledgePackageValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Knowledge package name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Knowledge package category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Knowledge package status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: KnowledgePackage,
    input: UpdateKnowledgePackageInput,
  ): Promise<KnowledgePackageValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Knowledge package name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Knowledge package category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Knowledge package status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Knowledge package is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
