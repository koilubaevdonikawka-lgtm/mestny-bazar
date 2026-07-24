import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

/** Future integration point for external skill providers. Not wired yet. */
export interface IRemoteSkillProvider {
  fetchRemote(skillId: string): Promise<Skill | null>;
  pushRemote(skill: Skill): Promise<void>;
}
