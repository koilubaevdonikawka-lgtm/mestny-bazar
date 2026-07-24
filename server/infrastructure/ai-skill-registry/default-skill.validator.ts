import type {
  ISkillValidator,
  SkillValidationResult,
} from "@server/application/ai-skill-registry/contracts/skill-validator.contract";
import type {
  RegisterSkillInput,
  Skill,
  UpdateSkillInput,
} from "@server/application/ai-skill-registry/models/skill.model";

/** Default skill validator. */
export class DefaultSkillValidator implements ISkillValidator {
  async validateRegistration(input: RegisterSkillInput): Promise<SkillValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Skill name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Skill category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Skill status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Skill,
    input: UpdateSkillInput,
  ): Promise<SkillValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Skill name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Skill category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Skill status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Skill is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
