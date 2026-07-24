import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

export interface ISkillCatalog {
  register(skill: Skill): Promise<void>;
  remove(skillId: string): Promise<void>;
  findById(skillId: string): Promise<Skill | null>;
  findByName(name: string): Promise<Skill | null>;
  findByCategory(category: string): Promise<readonly Skill[]>;
  listAll(): Promise<readonly Skill[]>;
}
