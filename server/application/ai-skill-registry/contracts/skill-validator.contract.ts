import type {
  RegisterSkillInput,
  Skill,
  UpdateSkillInput,
} from "@server/application/ai-skill-registry/models/skill.model";

export interface SkillValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ISkillValidator {
  validateRegistration(input: RegisterSkillInput): Promise<SkillValidationResult>;
  validateUpdate(existing: Skill, input: UpdateSkillInput): Promise<SkillValidationResult>;
}
