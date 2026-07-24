import type { ISkillCatalog } from "@server/application/ai-skill-registry/contracts/skill-catalog.contract";
import type { Skill } from "@server/application/ai-skill-registry/models/skill.model";

/** Default in-memory skill catalog index. */
export class DefaultSkillCatalog implements ISkillCatalog {
  private readonly skills = new Map<string, Skill>();
  private readonly skillsByName = new Map<string, string>();
  private readonly skillsByCategory = new Map<string, Set<string>>();

  async register(skill: Skill): Promise<void> {
    const existing = this.skills.get(skill.skillId);
    if (existing) {
      if (existing.name !== skill.name) {
        this.skillsByName.delete(existing.name);
      }
      if (existing.category !== skill.category) {
        this.removeFromCategory(existing.category, existing.skillId);
      }
    }

    this.skills.set(skill.skillId, skill);
    this.skillsByName.set(skill.name, skill.skillId);
    this.addToCategory(skill.category, skill.skillId);
  }

  async remove(skillId: string): Promise<void> {
    const skill = this.skills.get(skillId.trim());
    if (!skill) {
      return;
    }
    this.skills.delete(skill.skillId);
    this.skillsByName.delete(skill.name);
    this.removeFromCategory(skill.category, skill.skillId);
  }

  async findById(skillId: string): Promise<Skill | null> {
    return this.skills.get(skillId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Skill | null> {
    const skillId = this.skillsByName.get(name.trim());
    if (!skillId) {
      return null;
    }
    return this.skills.get(skillId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Skill[]> {
    const skillIds = this.skillsByCategory.get(category.trim());
    if (!skillIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...skillIds]
        .map((skillId) => this.skills.get(skillId))
        .filter((skill): skill is Skill => skill !== undefined),
    );
  }

  async listAll(): Promise<readonly Skill[]> {
    return Object.freeze([...this.skills.values()]);
  }

  private addToCategory(category: string, skillId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.skillsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(skillId);
    this.skillsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, skillId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.skillsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(skillId);
    if (categorySet.size === 0) {
      this.skillsByCategory.delete(normalizedCategory);
    }
  }
}
