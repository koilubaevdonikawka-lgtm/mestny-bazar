import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

/** Future integration point for skill export. Not wired yet. */
export interface ISkillExportProvider {
  exportTo(skills: readonly Skill[]): Promise<string>;
}
