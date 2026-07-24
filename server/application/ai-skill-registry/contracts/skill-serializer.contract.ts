import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

export interface ISkillSerializer {
  serialize(skill: Skill): Promise<string>;
  deserialize(serialized: string): Promise<Skill>;
}
