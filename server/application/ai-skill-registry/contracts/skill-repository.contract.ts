import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

export interface ISkillRepository {
  save(skill: Skill): Promise<void>;
  findById(skillId: string): Promise<Skill | null>;
  findByName(name: string): Promise<Skill | null>;
  findByCategory(category: string): Promise<readonly Skill[]>;
  findAll(): Promise<readonly Skill[]>;
  delete(skillId: string): Promise<boolean>;
}
