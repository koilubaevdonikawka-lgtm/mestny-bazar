import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

/** Future integration point for skill version management. Not wired yet. */
export interface ISkillVersionProvider {
  listVersions(skillId: string): Promise<readonly Skill[]>;
  getVersion(skillId: string, version: string): Promise<Skill | null>;
}
