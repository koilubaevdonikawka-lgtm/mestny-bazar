import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

/** Future integration point for skill import. Not wired yet. */
export interface ISkillImportProvider {
  importFrom(source: string): Promise<readonly Skill[]>;
}
