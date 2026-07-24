import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

/** Future integration point for skill synchronization. Not wired yet. */
export interface ISkillSynchronizationProvider {
  synchronize(skills: readonly Skill[]): Promise<void>;
}
